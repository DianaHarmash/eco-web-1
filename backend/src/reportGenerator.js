import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, 
    AlignmentType, BorderStyle, WidthType, ShadingType } from 'docx';
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Функция для генерации отчета в формате DOC
export async function generateDocReport(programId) {
try {
   // Получение данных о программе
   const programQuery = `
       SELECT * FROM regional_program WHERE id = $1
   `;
   const programResult = await pool.query(programQuery, [programId]);
   
   if (programResult.rows.length === 0) {
       throw new Error('Программа не найдена');
   }
   
   const program = programResult.rows[0];
   
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
       ORDER BY mc.category_name, pm.priority
   `;
   
   const measuresResult = await pool.query(measuresQuery, [programId]);
   const measures = measuresResult.rows;
   
   // Получение законодательных документов, связанных с мероприятиями
   const legislationsQuery = `
       SELECT DISTINCT 
           ld.*
       FROM measure_legislation ml
       JOIN legislation_document ld ON ml.legislation_id = ld.id
       WHERE ml.measure_id IN (
           SELECT m.id 
           FROM program_measure pm
           JOIN eco_measure m ON pm.measure_id = m.id
           WHERE pm.program_id = $1
       )
   `;
   
   const legislationsResult = await pool.query(legislationsQuery, [programId]);
   const legislations = legislationsResult.rows;
   
   // Группируем мероприятия по категориям
   const categorizedMeasures = {};
   measures.forEach(measure => {
       if (!categorizedMeasures[measure.category_name]) {
           categorizedMeasures[measure.category_name] = [];
       }
       categorizedMeasures[measure.category_name].push(measure);
   });
   
   // Создание документа
   const doc = new Document({
       title: program.program_name,
       description: program.description,
       styles: {
           paragraphStyles: [
               {
                   id: "Normal",
                   name: "Normal",
                   run: {
                       font: "Times New Roman",
                       size: 24, // 12pt
                   }
               },
               {
                   id: "Heading1",
                   name: "Heading 1",
                   run: {
                       font: "Times New Roman",
                       size: 32, // 16pt
                       bold: true,
                   },
                   paragraph: {
                       spacing: {
                           before: 340, // 17pt
                           after: 340, // 17pt
                       },
                   },
               },
               {
                   id: "Heading2",
                   name: "Heading 2",
                   run: {
                       font: "Times New Roman",
                       size: 28, // 14pt
                       bold: true,
                   },
                   paragraph: {
                       spacing: {
                           before: 240, // 12pt
                           after: 240, // 12pt
                       },
                   },
               },
               {
                   id: "TableHeader",
                   name: "Table Header",
                   run: {
                       font: "Times New Roman",
                       size: 24, // 12pt
                       bold: true,
                   },
               },
           ],
       },
   });
   
   // Титульный лист
   const headerContent = [
       new Paragraph({
           text: program.program_name.toUpperCase(),
           heading: HeadingLevel.HEADING_1,
           alignment: AlignmentType.CENTER,
       }),
       new Paragraph({
           text: `Програма заходів для покращення еко-енерго-економічного стану регіону на ${program.start_date ? new Date(program.start_date).getFullYear() : ""} - ${program.end_date ? new Date(program.end_date).getFullYear() : ""} роки`,
           alignment: AlignmentType.CENTER,
           spacing: {
               after: 400,
           },
       }),
   ];
   
   if (program.description) {
       headerContent.push(
           new Paragraph({
               text: "ОПИС ПРОГРАМИ:",
               heading: HeadingLevel.HEADING_2,
           }),
           new Paragraph({
               text: program.description,
               spacing: {
                   after: 400,
               },
           })
       );
   }
   
   // Информация о программе
   const infoContent = [
       new Paragraph({
           text: "ІНФОРМАЦІЯ ПРО ПРОГРАМУ",
           heading: HeadingLevel.HEADING_2,
       }),
       new Table({
           rows: [
               new TableRow({
                   children: [
                       new TableCell({
                           children: [new Paragraph("Статус програми:")],
                           width: { size: 30, type: WidthType.PERCENTAGE },
                       }),
                       new TableCell({
                           children: [new Paragraph(program.status || "Не визначено")],
                           width: { size: 70, type: WidthType.PERCENTAGE },
                       }),
                   ],
               }),
               program.start_date ? new TableRow({
                   children: [
                       new TableCell({
                           children: [new Paragraph("Термін реалізації:")],
                       }),
                       new TableCell({
                           children: [new Paragraph(`${new Date(program.start_date).toLocaleDateString()} - ${new Date(program.end_date).toLocaleDateString()}`)],
                       }),
                   ],
               }) : null,
               new TableRow({
                   children: [
                       new TableCell({
                           children: [new Paragraph("Загальний бюджет програми:")],
                       }),
                       new TableCell({
                           children: [new Paragraph(`${program.total_budget.toLocaleString('uk-UA')} грн`)],
                       }),
                   ],
               }),
               new TableRow({
                   children: [
                       new TableCell({
                           children: [new Paragraph("Кількість заходів у програмі:")],
                       }),
                       new TableCell({
                           children: [new Paragraph(`${measures.length}`)],
                       }),
                   ],
               }),
           ].filter(Boolean),
           width: { size: 100, type: WidthType.PERCENTAGE },
       }),
       new Paragraph({
           text: "",
           spacing: { after: 200 },
       }),
   ];
   
   // Мероприятия по категориям
   const measuresContent = [
       new Paragraph({
           text: "ЗАХОДИ ПРОГРАМИ",
           heading: HeadingLevel.HEADING_2,
       }),
   ];
   
   // Добавляем мероприятия по категориям
   Object.entries(categorizedMeasures).forEach(([category, categoryMeasures]) => {
       measuresContent.push(
           new Paragraph({
               text: category,
               heading: HeadingLevel.HEADING_3,
               spacing: { before: 300, after: 200 },
           })
       );
       
       // Создание таблицы мероприятий для категории
       const measureRows = [
           new TableRow({
               children: [
                   new TableCell({
                       children: [new Paragraph({ text: "№", style: "TableHeader" })],
                       width: { size: 5, type: WidthType.PERCENTAGE },
                       shading: { fill: "D3D3D3", val: ShadingType.CLEAR },
                   }),
                   new TableCell({
                       children: [new Paragraph({ text: "Назва заходу", style: "TableHeader" })],
                       width: { size: 40, type: WidthType.PERCENTAGE },
                       shading: { fill: "D3D3D3", val: ShadingType.CLEAR },
                   }),
                   new TableCell({
                       children: [new Paragraph({ text: "Термін реалізації", style: "TableHeader" })],
                       width: { size: 15, type: WidthType.PERCENTAGE },
                       shading: { fill: "D3D3D3", val: ShadingType.CLEAR },
                   }),
                   new TableCell({
                       children: [new Paragraph({ text: "Вартість, грн", style: "TableHeader" })],
                       width: { size: 15, type: WidthType.PERCENTAGE },
                       shading: { fill: "D3D3D3", val: ShadingType.CLEAR },
                   }),
                   new TableCell({
                       children: [new Paragraph({ text: "Очікувана ефективність", style: "TableHeader" })],
                       width: { size: 25, type: WidthType.PERCENTAGE },
                       shading: { fill: "D3D3D3", val: ShadingType.CLEAR },
                   }),
               ],
               tableHeader: true,
           }),
           ...categoryMeasures.map((measure, index) => {
               return new TableRow({
                   children: [
                       new TableCell({
                           children: [new Paragraph(`${index + 1}`)],
                       }),
                       new TableCell({
                           children: [
                               new Paragraph(measure.measure_name),
                               measure.description ? new Paragraph({
                                   text: measure.description,
                                   style: "Normal",
                                   spacing: { before: 100 },
                                   color: "666666",
                               }) : null,
                           ].filter(Boolean),
                       }),
                       new TableCell({
                           children: [new Paragraph(measure.implementation_time || "Не визначено")],
                       }),
                       new TableCell({
                           children: [new Paragraph({
                               text: measure.estimated_cost.toLocaleString('uk-UA'),
                               alignment: AlignmentType.RIGHT,
                           })],
                       }),
                       new TableCell({
                           children: [new Paragraph(measure.effectiveness_description || "")],
                       }),
                   ],
               });
           }),
       ];
       
       measuresContent.push(
           new Table({
               rows: measureRows,
               width: { size: 100, type: WidthType.PERCENTAGE },
           })
       );
       
       // Пустая строка после таблицы
       measuresContent.push(
           new Paragraph({
               text: "",
               spacing: { after: 200 },
           })
       );
   });
   
   // Законодательные документы
   const legislationContent = [
       new Paragraph({
           text: "НОРМАТИВНО-ПРАВОВА БАЗА",
           heading: HeadingLevel.HEADING_2,
       }),
   ];
   
   if (legislations.length > 0) {
       const legislationRows = [
           new TableRow({
               children: [
                   new TableCell({
                       children: [new Paragraph({ text: "№", style: "TableHeader" })],
                       width: { size: 5, type: WidthType.PERCENTAGE },
                       shading: { fill: "D3D3D3", val: ShadingType.CLEAR },
                   }),
                   new TableCell({
                       children: [new Paragraph({ text: "Назва документу", style: "TableHeader" })],
                       width: { size: 45, type: WidthType.PERCENTAGE },
                       shading: { fill: "D3D3D3", val: ShadingType.CLEAR },
                   }),
                   new TableCell({
                       children: [new Paragraph({ text: "Номер", style: "TableHeader" })],
                       width: { size: 15, type: WidthType.PERCENTAGE },
                       shading: { fill: "D3D3D3", val: ShadingType.CLEAR },
                   }),
                   new TableCell({
                       children: [new Paragraph({ text: "Дата прийняття", style: "TableHeader" })],
                       width: { size: 15, type: WidthType.PERCENTAGE },
                       shading: { fill: "D3D3D3", val: ShadingType.CLEAR },
                   }),
                   new TableCell({
                       children: [new Paragraph({ text: "Орган, що затвердив", style: "TableHeader" })],
                       width: { size: 20, type: WidthType.PERCENTAGE },
                       shading: { fill: "D3D3D3", val: ShadingType.CLEAR },
                   }),
               ],
               tableHeader: true,
           }),
           ...legislations.map((doc, index) => {
               return new TableRow({
                   children: [
                       new TableCell({
                           children: [new Paragraph(`${index + 1}`)],
                       }),
                       new TableCell({
                           children: [new Paragraph(doc.document_name)],
                       }),
                       new TableCell({
                           children: [new Paragraph(doc.document_number || "")],
                       }),
                       new TableCell({
                           children: [new Paragraph(doc.issue_date ? new Date(doc.issue_date).toLocaleDateString() : "")],
                       }),
                       new TableCell({
                           children: [new Paragraph(doc.issuing_authority || "")],
                       }),
                   ],
               });
           }),
       ];
       
       legislationContent.push(
           new Table({
               rows: legislationRows,
               width: { size: 100, type: WidthType.PERCENTAGE },
           })
       );
   } else {
       legislationContent.push(
           new Paragraph({
               text: "Немає пов'язаних законодавчих документів",
               spacing: { after: 200 },
           })
       );
   }
   
   // Заключение
   const conclusionContent = [
       new Paragraph({
           text: "ВИСНОВКИ",
           heading: HeadingLevel.HEADING_2,
       }),
       new Paragraph({
           text: `Програма "${program.program_name}" включає ${measures.length} заходів загальною вартістю ${program.total_budget.toLocaleString('uk-UA')} грн.`,
       }),
       new Paragraph({
           text: "Впровадження запропонованих заходів дозволить покращити еко-енерго-економічний стан регіону та забезпечити його сталий розвиток.",
       }),
       new Paragraph({
           text: "",
           spacing: { after: 400 },
       }),
       new Paragraph({
           text: `Документ сформовано: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
           alignment: AlignmentType.RIGHT,
           spacing: { before: 400 },
       }),
   ];
   
   // Объединяем все разделы в документ
   doc.addSection({
       children: [
           ...headerContent,
           ...infoContent,
           ...measuresContent,
           ...legislationContent,
           ...conclusionContent,
       ],
   });
   
   // Сохраняем документ
   const filename = `program_report_${programId}_${Date.now()}.docx`;
   const filePath = path.join(__dirname, '..', 'public', 'reports', filename);
   
   // Создаем директорию, если она не существует
   const dir = path.dirname(filePath);
   if (!fs.existsSync(dir)) {
       fs.mkdirSync(dir, { recursive: true });
   }
   
   // Сохраняем документ
   const buffer = await Packer.toBuffer(doc);
   fs.writeFileSync(filePath, buffer);
   
   return {
       filename,
       path: `/reports/${filename}`,
       fullPath: filePath
   };
} catch (error) {
   console.error('Error generating DOC report:', error);
   throw error;
}
}

// Функция для генерации сметы в формате XLS
export async function generateXlsEstimate(programId) {
try {
   // Получение данных о программе
   const programQuery = `
       SELECT * FROM regional_program WHERE id = $1
   `;
   const programResult = await pool.query(programQuery, [programId]);
   
   if (programResult.rows.length === 0) {
       throw new Error('Программа не найдена');
   }
   
   const program = programResult.rows[0];
   
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
       ORDER BY mc.category_name, pm.priority
   `;
   
   const measuresResult = await pool.query(measuresQuery, [programId]);
   const measures = measuresResult.rows;
   
   // Получение ресурсов для мероприятий
   const resourcesQuery = `
       SELECT 
           mr.*,
           m.measure_name,
           m.category_id,
           mc.category_name
       FROM measure_resource mr
       JOIN eco_measure m ON mr.measure_id = m.id
       JOIN measure_category mc ON m.category_id = mc.id
       WHERE mr.measure_id IN (
           SELECT m.id 
           FROM program_measure pm
           JOIN eco_measure m ON pm.measure_id = m.id
           WHERE pm.program_id = $1
       )
       ORDER BY mc.category_name, m.measure_name
   `;
   
   const resourcesResult = await pool.query(resourcesQuery, [programId]);
   const resources = resourcesResult.rows;
   
   // Группируем мероприятия по категориям
   const categorizedMeasures = {};
   measures.forEach(measure => {
       if (!categorizedMeasures[measure.category_name]) {
           categorizedMeasures[measure.category_name] = [];
       }
       categorizedMeasures[measure.category_name].push(measure);
   });
   
   // Создание Excel файла
   const workbook = new ExcelJS.Workbook();
   workbook.creator = 'Eco-Energy-Economic Monitoring System';
   workbook.lastModifiedBy = 'System';
   workbook.created = new Date();
   workbook.modified = new Date();
   
   // Лист с общей информацией
   const summarySheet = workbook.addWorksheet('Загальна інформація');
   
   // Добавляем заголовок
   summarySheet.mergeCells('A1:G1');
   const titleCell = summarySheet.getCell('A1');
   titleCell.value = program.program_name;
   titleCell.font = { size: 16, bold: true };
   titleCell.alignment = { horizontal: 'center' };
   
   // Добавляем информацию о программе
   summarySheet.mergeCells('A3:G3');
   const infoCell = summarySheet.getCell('A3');
   infoCell.value = 'ІНФОРМАЦІЯ ПРО ПРОГРАМУ';
   infoCell.font = { size: 14, bold: true };
   
   summarySheet.getCell('A4').value = 'Статус програми:';
   summarySheet.getCell('B4').value = program.status || 'Не визначено';
   
   summarySheet.getCell('A5').value = 'Термін реалізації:';
   summarySheet.getCell('B5').value = program.start_date && program.end_date ? 
       `${new Date(program.start_date).toLocaleDateString()} - ${new Date(program.end_date).toLocaleDateString()}` : 
       'Не визначено';
   
   summarySheet.getCell('A6').value = 'Загальний бюджет програми:';
   summarySheet.getCell('B6').value = program.total_budget;
   summarySheet.getCell('B6').numFmt = '0,0.00" грн"';
   
   summarySheet.getCell('A7').value = 'Кількість заходів у програмі:';
   summarySheet.getCell('B7').value = measures.length;
   
   // Форматирование столбцов
   summarySheet.getColumn('A').width = 30;
   summarySheet.getColumn('B').width = 25;
   summarySheet.getColumn('C').width = 20;
   summarySheet.getColumn('D').width = 20;
   summarySheet.getColumn('E').width = 25;
   summarySheet.getColumn('F').width = 20;
   summarySheet.getColumn('G').width = 20;
   
   // Добавляем сводную таблицу по категориям
   summarySheet.mergeCells('A9:G9');
   const categoriesCell = summarySheet.getCell('A9');
   categoriesCell.value = 'РОЗПОДІЛ БЮДЖЕТУ ЗА КАТЕГОРІЯМИ ЗАХОДІВ';
   categoriesCell.font = { size: 14, bold: true };
   
   const headers = ['Категорія', 'Кількість заходів', 'Вартість, грн', '% від загального бюджету'];
   summarySheet.getCell('A10').value = headers[0];
   summarySheet.getCell('B10').value = headers[1];
   summarySheet.getCell('C10').value = headers[2];
   summarySheet.getCell('D10').value = headers[3];
   
   // Форматирование заголовков
   ['A10', 'B10', 'C10', 'D10'].forEach(cell => {
       summarySheet.getCell(cell).font = { bold: true };
       summarySheet.getCell(cell).fill = {
           type: 'pattern',
           pattern: 'solid',
           fgColor: { argb: 'D3D3D3' }
       };
       summarySheet.getCell(cell).border = {
           top: { style: 'thin' },
           left: { style: 'thin' },
           bottom: { style: 'thin' },
           right: { style: 'thin' }
       };
   });
   
   // Заполнение сводной таблицы
   let rowIndex = 11;
   let totalMeasuresCount = 0;
   let totalCost = 0;
   
   Object.entries(categorizedMeasures).forEach(([category, categoryMeasures]) => {
       const categoryTotal = categoryMeasures.reduce((sum, measure) => sum + measure.estimated_cost, 0);
       totalCost += categoryTotal;
       totalMeasuresCount += categoryMeasures.length;
       
       summarySheet.getCell(`A${rowIndex}`).value = category;
       summarySheet.getCell(`B${rowIndex}`).value = categoryMeasures.length;
       summarySheet.getCell(`C${rowIndex}`).value = categoryTotal;
       summarySheet.getCell(`C${rowIndex}`).numFmt = '0,0.00" грн"';
       
       // Процент от общего бюджета
       const percentage = (categoryTotal / program.total_budget) * 100;
       summarySheet.getCell(`D${rowIndex}`).value = percentage;
       summarySheet.getCell(`D${rowIndex}`).numFmt = '0.00"%"';
       
       // Границы для ячеек
       ['A', 'B', 'C', 'D'].forEach(col => {
           summarySheet.getCell(`${col}${rowIndex}`).border = {
               top: { style: 'thin' },
               left: { style: 'thin' },
               bottom: { style: 'thin' },
               right: { style: 'thin' }
           };
       });
       
       rowIndex++;
   });
   
   // Итоговая строка
   summarySheet.getCell(`A${rowIndex}`).value = 'ВСЬОГО';
   summarySheet.getCell(`B${rowIndex}`).value = totalMeasuresCount;
   summarySheet.getCell(`C${rowIndex}`).value = totalCost;
   summarySheet.getCell(`C${rowIndex}`).numFmt = '0,0.00" грн"';
   summarySheet.getCell(`D${rowIndex}`).value = 100;
   summarySheet.getCell(`D${rowIndex}`).numFmt = '0.00"%"';
   
   // Форматирование итоговой строки
   ['A', 'B', 'C', 'D'].forEach(col => {
       summarySheet.getCell(`${col}${rowIndex}`).font = { bold: true };
       summarySheet.getCell(`${col}${rowIndex}`).border = {
           top: { style: 'thin' },
           left: { style: 'thin' },
           bottom: { style: 'double' },
           right: { style: 'thin' }
       };
       summarySheet.getCell(`${col}${rowIndex}`).fill = {
           type: 'pattern',
           pattern: 'solid',
           fgColor: { argb: 'E6E6E6' }
       };
   });
   
   // Лист с детальной сметой
   const detailSheet = workbook.addWorksheet('Детальний кошторис');
   
   // Заголовок
   detailSheet.mergeCells('A1:G1');
   const detailTitleCell = detailSheet.getCell('A1');
   detailTitleCell.value = `ДЕТАЛЬНИЙ КОШТОРИС - ${program.program_name}`;
   detailTitleCell.font = { size: 16, bold: true };
   detailTitleCell.alignment = { horizontal: 'center' };
   
   // Заголовки столбцов для детальной сметы
   const detailHeaders = ['№', 'Категорія', 'Захід', 'Термін реалізації', 'Вартість, грн', 'Ефективність'];
   for (let i = 0; i < detailHeaders.length; i++) {
       const cell = detailSheet.getCell(3, i + 1);
       cell.value = detailHeaders[i];
       cell.font = { bold: true };
       cell.fill = {
           type: 'pattern',
           pattern: 'solid',
           fgColor: { argb: 'D3D3D3' }
       };
       cell.border = {
           top: { style: 'thin' },
           left: { style: 'thin' },
           bottom: { style: 'thin' },
           right: { style: 'thin' }
       };
   }
   
   // Заполнение детальной сметы
   let detailRowIndex = 4;
   let measureNumber = 1;
   
   measures.forEach(measure => {
       detailSheet.getCell(detailRowIndex, 1).value = measureNumber;
       detailSheet.getCell(detailRowIndex, 2).value = measure.category_name;
       detailSheet.getCell(detailRowIndex, 3).value = measure.measure_name;
       detailSheet.getCell(detailRowIndex, 4).value = measure.implementation_time;
       detailSheet.getCell(detailRowIndex, 5).value = measure.estimated_cost;
       detailSheet.getCell(detailRowIndex, 5).numFmt = '0,0.00" грн"';
       detailSheet.getCell(detailRowIndex, 6).value = measure.effectiveness_description;
       
       // Границы для ячеек
       for (let i = 1; i <= 6; i++) {
           detailSheet.getCell(detailRowIndex, i).border = {
               top: { style: 'thin' },
               left: { style: 'thin' },
               bottom: { style: 'thin' },
               right: { style: 'thin' }
           };
       }
       
       measureNumber++;
       detailRowIndex++;
   });
   
   // Ширина столбцов
   detailSheet.getColumn(1).width = 5;
   detailSheet.getColumn(2).width = 25;
   detailSheet.getColumn(3).width = 50;
   detailSheet.getColumn(4).width = 20;
   detailSheet.getColumn(5).width = 15;
   detailSheet.getColumn(6).width = 40;
   
   // Лист с ресурсами
   if (resources.length > 0) {
       const resourcesSheet = workbook.addWorksheet('Ресурси');
       
       // Заголовок
       resourcesSheet.mergeCells('A1:H1');
       const resourcesTitleCell = resourcesSheet.getCell('A1');
       resourcesTitleCell.value = 'ДЕТАЛІЗАЦІЯ РЕСУРСІВ ДЛЯ ЗАХОДІВ';
       resourcesTitleCell.font = { size: 16, bold: true };
       resourcesTitleCell.alignment = { horizontal: 'center' };
       
       // Заголовки столбцов для ресурсов
       const resourceHeaders = ['№', 'Захід', 'Категорія', 'Ресурс', 'Тип ресурсу', 'Кількість', 'Ціна за од., грн', 'Загальна вартість, грн'];
       for (let i = 0; i < resourceHeaders.length; i++) {
           const cell = resourcesSheet.getCell(3, i + 1);
           cell.value = resourceHeaders[i];
           cell.font = { bold: true };
           cell.fill = {
               type: 'pattern',
               pattern: 'solid',
               fgColor: { argb: 'D3D3D3' }
           };
           cell.border = {
               top: { style: 'thin' },
               left: { style: 'thin' },
               bottom: { style: 'thin' },
               right: { style: 'thin' }
           };
       }
       
       // Заполнение ресурсов
       let resourceRowIndex = 4;
       let resourceNumber = 1;
       
       resources.forEach(resource => {
           resourcesSheet.getCell(resourceRowIndex, 1).value = resourceNumber;
           resourcesSheet.getCell(resourceRowIndex, 2).value = resource.measure_name;
           resourcesSheet.getCell(resourceRowIndex, 3).value = resource.category_name;
           resourcesSheet.getCell(resourceRowIndex, 4).value = resource.resource_name;
           resourcesSheet.getCell(resourceRowIndex, 5).value = resource.resource_type;
           
           const quantityCell = resourcesSheet.getCell(resourceRowIndex, 6);
           quantityCell.value = resource.quantity;
           if (resource.unit) {
               quantityCell.numFmt = `0.00" ${resource.unit}"`;
           }
           
           resourcesSheet.getCell(resourceRowIndex, 7).value = resource.cost_per_unit;
           resourcesSheet.getCell(resourceRowIndex, 7).numFmt = '0,0.00" грн"';
           
           resourcesSheet.getCell(resourceRowIndex, 8).value = resource.total_cost;
           resourcesSheet.getCell(resourceRowIndex, 8).numFmt = '0,0.00" грн"';
           
           // Границы для ячеек
           for (let i = 1; i <= 8; i++) {
               resourcesSheet.getCell(resourceRowIndex, i).border = {
                   top: { style: 'thin' },
                   left: { style: 'thin' },
                   bottom: { style: 'thin' },
                   right: { style: 'thin' }
               };
           }
           
           resourceNumber++;
           resourceRowIndex++;
       });
       
       // Ширина столбцов
       resourcesSheet.getColumn(1).width = 5;
       resourcesSheet.getColumn(2).width = 40;
       resourcesSheet.getColumn(3).width = 25;
       resourcesSheet.getColumn(4).width = 30;
       resourcesSheet.getColumn(5).width = 15;
       resourcesSheet.getColumn(6).width = 15;
       resourcesSheet.getColumn(7).width = 15;
       resourcesSheet.getColumn(8).width = 20;
   }
   
   // Сохраняем Excel файл
   const filename = `program_estimate_${programId}_${Date.now()}.xlsx`;
   const filePath = path.join(__dirname, '..', 'public', 'reports', filename);
   
   // Создаем директорию, если она не существует
   const dir = path.dirname(filePath);
   if (!fs.existsSync(dir)) {
       fs.mkdirSync(dir, { recursive: true });
   }
   
   // Сохраняем файл
   await workbook.xlsx.writeFile(filePath);
   
   return {
       filename,
       path: `/reports/${filename}`,
       fullPath: filePath
   };
} catch (error) {
   console.error('Error generating XLS estimate:', error);
   throw error;
}
}