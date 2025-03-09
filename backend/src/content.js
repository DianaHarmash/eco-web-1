import express from 'express';
import pool from './db.js';
import { generateDocReport, generateXlsEstimate } from './reportGenerator.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

router.get('/all-factories-data', async (req, res) => {
    try {
        const result = await pool.query(`
            WITH measurements_data AS (
                SELECT 
                    cm.factory_id,
                    c.id as category_id,
                    c.category_name,
                    cc.component_name,
                    cm.value,
                    cm.unit,
                    TO_CHAR(cm.measurement_date, 'YYYY-MM-DD') as measurement_date
                FROM component_measurement cm
                JOIN category_component cc ON cm.component_id = cc.id
                JOIN category c ON cc.category_id = c.id
                ORDER BY cm.measurement_date ASC
            )
            SELECT 
                ef.id,
                ef.factory_name,
                fc.latitude,
                fc.longitude,
                json_agg(
                    json_build_object(
                        'category_id', md.category_id,
                        'category_name', md.category_name,
                        'component_name', md.component_name,
                        'value', md.value,
                        'unit', md.unit,
                        'measurement_date', md.measurement_date
                    ) ORDER BY md.measurement_date
                ) as measurements
            FROM eco_factory ef
            JOIN factory_coordinates fc ON ef.id = fc.factory_id
            LEFT JOIN measurements_data md ON ef.id = md.factory_id
            GROUP BY ef.id, ef.factory_name, fc.latitude, fc.longitude
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Функции для работы с API мероприятий
export const getMeasureCategories = async () => {
    try {
        const result = await pool.query('SELECT * FROM measure_category ORDER BY category_name');
        return result.rows;
    } catch (error) {
        console.error('Error getting measure categories:', error);
        throw error;
    }
};

export const getMeasures = async (categoryId = null) => {
    try {
        let query = `
            SELECT 
                m.*, 
                mc.category_name
            FROM eco_measure m
            JOIN measure_category mc ON m.category_id = mc.id
        `;
        
        const queryParams = [];
        
        if (categoryId) {
            query += ' WHERE m.category_id = $1';
            queryParams.push(categoryId);
        }
        
        query += ' ORDER BY m.category_id, m.measure_name';
        
        const result = await pool.query(query, queryParams);
        return result.rows;
    } catch (error) {
        console.error('Error getting measures:', error);
        throw error;
    }
};

export const getFactoryMeasures = async (factoryId) => {
    try {
        const query = `
            SELECT 
                fm.id as factory_measure_id,
                fm.priority,
                fm.status,
                fm.start_date,
                fm.planned_end_date,
                fm.actual_end_date,
                fm.notes,
                m.*,
                mc.category_name
            FROM factory_measure fm
            JOIN eco_measure m ON fm.measure_id = m.id
            JOIN measure_category mc ON m.category_id = mc.id
            WHERE fm.factory_id = $1
            ORDER BY fm.priority, m.category_id, m.measure_name
        `;
        
        const result = await pool.query(query, [factoryId]);
        return result.rows;
    } catch (error) {
        console.error('Error getting factory measures:', error);
        throw error;
    }
};

export const addFactoryMeasure = async (factoryId, measureId, priority = 1, status = 'планується') => {
    try {
        const query = `
            INSERT INTO factory_measure (
                factory_id, measure_id, priority, status
            ) VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        
        const result = await pool.query(query, [factoryId, measureId, priority, status]);
        return result.rows[0];
    } catch (error) {
        console.error('Error adding factory measure:', error);
        throw error;
    }
};

export const getRegionalPrograms = async () => {
    try {
        const query = `
            SELECT 
                rp.*,
                (SELECT COUNT(*) FROM program_measure WHERE program_id = rp.id) as measures_count,
                (SELECT SUM(budget_allocation) FROM program_measure WHERE program_id = rp.id) as total_allocated_budget
            FROM regional_program rp
            ORDER BY rp.created_at DESC
        `;
        
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error getting regional programs:', error);
        throw error;
    }
};

export const createRegionalProgram = async (programData) => {
    try {
        const { 
            programName, 
            description, 
            startDate, 
            endDate, 
            status, 
            totalBudget, 
            createdBy 
        } = programData;
        
        const query = `
            INSERT INTO regional_program (
                program_name, description, start_date, end_date, status, total_budget, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        
        const values = [
            programName,
            description,
            startDate,
            endDate,
            status || 'планується',
            totalBudget,
            createdBy
        ];
        
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error creating regional program:', error);
        throw error;
    }
};

// Получение всех категорий мероприятий
router.get('/measure-categories', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM measure_category ORDER BY category_name');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Получение всех мероприятий (с возможностью фильтрации по категории)
router.get('/measures', async (req, res) => {
    try {
        const { categoryId } = req.query;
        let query = `
            SELECT 
                m.*, 
                mc.category_name,
                COALESCE(
                    (SELECT json_agg(
                        json_build_object(
                            'id', ld.id,
                            'document_name', ld.document_name,
                            'document_number', ld.document_number,
                            'issue_date', ld.issue_date,
                            'document_type', ld.document_type,
                            'issuing_authority', ld.issuing_authority,
                            'description', ld.description,
                            'url', ld.url
                        )
                    ) 
                    FROM measure_legislation ml
                    JOIN legislation_document ld ON ml.legislation_id = ld.id
                    WHERE ml.measure_id = m.id
                    ), '[]'::json) as legislation_documents,
                COALESCE(
                    (SELECT json_agg(
                        json_build_object(
                            'id', mr.id,
                            'resource_name', mr.resource_name,
                            'resource_type', mr.resource_type,
                            'quantity', mr.quantity,
                            'unit', mr.unit,
                            'cost_per_unit', mr.cost_per_unit,
                            'total_cost', mr.total_cost
                        )
                    )
                    FROM measure_resource mr
                    WHERE mr.measure_id = m.id
                    ), '[]'::json) as resources
            FROM eco_measure m
            JOIN measure_category mc ON m.category_id = mc.id
        `;
        
        const queryParams = [];
        
        if (categoryId) {
            query += ' WHERE m.category_id = $1';
            queryParams.push(categoryId);
        }
        
        query += ' ORDER BY m.category_id, m.measure_name';
        
        const result = await pool.query(query, queryParams);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Получение конкретного мероприятия по ID
router.get('/measures/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT 
                m.*, 
                mc.category_name,
                COALESCE(
                    (SELECT json_agg(
                        json_build_object(
                            'id', ld.id,
                            'document_name', ld.document_name,
                            'document_number', ld.document_number,
                            'issue_date', ld.issue_date,
                            'document_type', ld.document_type,
                            'issuing_authority', ld.issuing_authority,
                            'description', ld.description,
                            'url', ld.url
                        )
                    ) 
                    FROM measure_legislation ml
                    JOIN legislation_document ld ON ml.legislation_id = ld.id
                    WHERE ml.measure_id = m.id
                    ), '[]'::json) as legislation_documents,
                COALESCE(
                    (SELECT json_agg(
                        json_build_object(
                            'id', mr.id,
                            'resource_name', mr.resource_name,
                            'resource_type', mr.resource_type,
                            'quantity', mr.quantity,
                            'unit', mr.unit,
                            'cost_per_unit', mr.cost_per_unit,
                            'total_cost', mr.total_cost
                        )
                    )
                    FROM measure_resource mr
                    WHERE mr.measure_id = m.id
                    ), '[]'::json) as resources
            FROM eco_measure m
            JOIN measure_category mc ON m.category_id = mc.id
            WHERE m.id = $1
        `;
        
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Мероприятие не найдено' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Получение мероприятий для конкретного объекта (factory)
router.get('/factory/:factoryId/measures', async (req, res) => {
    try {
        const { factoryId } = req.params;
        
        const query = `
            SELECT 
                fm.id as factory_measure_id,
                fm.priority,
                fm.status,
                fm.start_date,
                fm.planned_end_date,
                fm.actual_end_date,
                fm.notes,
                m.*,
                mc.category_name
            FROM factory_measure fm
            JOIN eco_measure m ON fm.measure_id = m.id
            JOIN measure_category mc ON m.category_id = mc.id
            WHERE fm.factory_id = $1
            ORDER BY fm.priority, m.category_id, m.measure_name
        `;
        
        const result = await pool.query(query, [factoryId]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Добавление мероприятия для объекта
router.post('/factory/:factoryId/measures', async (req, res) => {
    try {
        const { factoryId } = req.params;
        const { measureId, priority, status, startDate, plannedEndDate, notes } = req.body;
        
        // Проверка существования фабрики
        const factoryCheck = await pool.query('SELECT id FROM eco_factory WHERE id = $1', [factoryId]);
        if (factoryCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Объект не найден' });
        }
        
        // Проверка существования мероприятия
        const measureCheck = await pool.query('SELECT id FROM eco_measure WHERE id = $1', [measureId]);
        if (measureCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Мероприятие не найдено' });
        }
        
        // Проверка на дублирование мероприятия для объекта
        const duplicateCheck = await pool.query(
            'SELECT id FROM factory_measure WHERE factory_id = $1 AND measure_id = $2',
            [factoryId, measureId]
        );
        
        if (duplicateCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Данное мероприятие уже добавлено для этого объекта' });
        }
        
        const query = `
            INSERT INTO factory_measure (
                factory_id, measure_id, priority, status, start_date, planned_end_date, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        
        const values = [
            factoryId,
            measureId,
            priority || 1,
            status || 'планується',
            startDate || null,
            plannedEndDate || null,
            notes || null
        ];
        
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Удаление мероприятия для объекта
router.delete('/factory-measures/:factoryMeasureId', async (req, res) => {
    try {
        const { factoryMeasureId } = req.params;
        
        const result = await pool.query(
            'DELETE FROM factory_measure WHERE id = $1 RETURNING id',
            [factoryMeasureId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Мероприятие для объекта не найдено' });
        }
        
        res.json({ message: 'Мероприятие успешно удалено', id: result.rows[0].id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Получение всех региональных программ
router.get('/regional-programs', async (req, res) => {
    try {
        const query = `
            SELECT 
                rp.*,
                (SELECT COUNT(*) FROM program_measure WHERE program_id = rp.id) as measures_count,
                (SELECT SUM(budget_allocation) FROM program_measure WHERE program_id = rp.id) as total_allocated_budget
            FROM regional_program rp
            ORDER BY rp.created_at DESC
        `;
        
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Получение конкретной региональной программы с ее мероприятиями
router.get('/regional-programs/:programId', async (req, res) => {
    try {
        const { programId } = req.params;
        
        // Получение информации о программе
        const programQuery = `
            SELECT * FROM regional_program WHERE id = $1
        `;
        const programResult = await pool.query(programQuery, [programId]);
        
        if (programResult.rows.length === 0) {
            return res.status(404).json({ error: 'Программа не найдена' });
        }
        
        // Получение мероприятий программы
        const measuresQuery = `
            SELECT 
                pm.priority,
                pm.budget_allocation,
                pm.planned_start_date,
                pm.planned_end_date,
                pm.notes,
                m.*,
                mc.category_name
            FROM program_measure pm
            JOIN eco_measure m ON pm.measure_id = m.id
            JOIN measure_category mc ON m.category_id = mc.id
            WHERE pm.program_id = $1
            ORDER BY pm.priority, m.category_id, m.measure_name
        `;
        
        const measuresResult = await pool.query(measuresQuery, [programId]);
        
        // Формирование ответа
        const program = programResult.rows[0];
        program.measures = measuresResult.rows;
        
        res.json(program);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Создание новой региональной программы
router.post('/regional-programs', async (req, res) => {
    try {
        const { 
            programName, 
            description, 
            startDate, 
            endDate, 
            status,
            totalBudget,
            createdBy
        } = req.body;
        
        const query = `
            INSERT INTO regional_program (
                program_name, description, start_date, end_date, status, total_budget, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        
        const values = [
            programName,
            description,
            startDate,
            endDate,
            status || 'планується',
            totalBudget,
            createdBy
        ];
        
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Добавление мероприятия в региональную программу
router.post('/regional-programs/:programId/measures', async (req, res) => {
    try {
        const { programId } = req.params;
        const { 
            measureId, 
            priority, 
            budgetAllocation, 
            plannedStartDate, 
            plannedEndDate, 
            notes 
        } = req.body;
        
        // Проверка существования программы
        const programCheck = await pool.query('SELECT id FROM regional_program WHERE id = $1', [programId]);
        if (programCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Программа не найдена' });
        }
        
        // Проверка существования мероприятия
        const measureCheck = await pool.query('SELECT id FROM eco_measure WHERE id = $1', [measureId]);
        if (measureCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Мероприятие не найдено' });
        }
        
        // Проверка на дублирование мероприятия в программе
        const duplicateCheck = await pool.query(
            'SELECT program_id FROM program_measure WHERE program_id = $1 AND measure_id = $2',
            [programId, measureId]
        );
        
        if (duplicateCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Данное мероприятие уже добавлено в эту программу' });
        }
        
        const query = `
            INSERT INTO program_measure (
                program_id, measure_id, priority, budget_allocation, planned_start_date, planned_end_date, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        
        const values = [
            programId,
            measureId,
            priority || 1,
            budgetAllocation,
            plannedStartDate,
            plannedEndDate,
            notes
        ];
        
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Удаление мероприятия из программы
router.delete('/regional-programs/:programId/measures/:measureId', async (req, res) => {
    try {
        const { programId, measureId } = req.params;
        
        const result = await pool.query(
            'DELETE FROM program_measure WHERE program_id = $1 AND measure_id = $2 RETURNING program_id',
            [programId, measureId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Мероприятие не найдено в указанной программе' });
        }
        
        res.json({ message: 'Мероприятие успешно удалено из программы' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API для генерации отчетов
router.get('/regional-programs/:programId/report/:format', async (req, res) => {
    try {
        const { programId, format } = req.params;
        
        if (format !== 'doc' && format !== 'xls') {
            return res.status(400).json({ error: 'Неподдерживаемый формат. Используйте doc или xls' });
        }
        
        let result;
        
        if (format === 'doc') {
            result = await generateDocReport(programId);
        } else {
            result = await generateXlsEstimate(programId);
        }
        
        res.json({
            success: true,
            fileUrl: result.path,
            filename: result.filename
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Получение отчета или сметы
router.get('/download-report/:filename', (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(__dirname, '../../public/reports', filename);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Файл не найден' });
        }
        
        // Определяем тип файла по расширению
        const fileExtension = path.extname(filename).toLowerCase();
        const mimeType = fileExtension === '.docx' 
            ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Получение объектов, связанных с программой
router.get('/regional-programs/:programId/factories', async (req, res) => {
    try {
        const { programId } = req.params;
        
        const query = `
            SELECT ef.* 
            FROM eco_factory ef
            JOIN program_factory pf ON ef.id = pf.factory_id
            WHERE pf.program_id = $1
        `;
        
        const result = await pool.query(query, [programId]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Привязка объектов к программе
router.post('/regional-programs/:programId/factories', async (req, res) => {
    try {
        const { programId } = req.params;
        const { factoryIds } = req.body;
        
        // Удаляем существующие связи
        await pool.query('DELETE FROM program_factory WHERE program_id = $1', [programId]);
        
        // Добавляем новые связи
        for (const factoryId of factoryIds) {
            await pool.query(
                'INSERT INTO program_factory (program_id, factory_id) VALUES ($1, $2)',
                [programId, factoryId]
            );
        }
        
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;