-- Категории заходов (мероприятий)
CREATE TABLE IF NOT EXISTS measure_category (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL,
    description TEXT
);

INSERT INTO measure_category (category_name, description) VALUES 
    ('Охорона атмосферного повітря', 'Заходи, спрямовані на зменшення забруднення атмосферного повітря'),
    ('Охорона водних ресурсів', 'Заходи з охорони та раціонального використання водних ресурсів'),
    ('Охорона ґрунтів', 'Заходи щодо покращення стану ґрунтів та збільшення їх родючості'),
    ('Енергоефективність', 'Енергетичні заходи для забезпечення енергоефективності та енергозбереження'),
    ('Поводження з відходами', 'Заходи, спрямовані на зменшення кількості відходів та їх утилізацію'),
    ('Екологічна освіта', 'Заходи з екологічного виховання та освіти'),
    ('Економічний розвиток', 'Заходи, спрямовані на економічний розвиток регіону'),
    ('Охорона здоров''я', 'Заходи для покращення стану здоров''я населення');

-- Законодательные документы, регулирующие правила внедрения заходов
CREATE TABLE IF NOT EXISTS legislation_document (
    id SERIAL PRIMARY KEY,
    document_name VARCHAR(255) NOT NULL,
    document_number VARCHAR(50),
    issue_date DATE,
    document_type VARCHAR(100),
    issuing_authority VARCHAR(255),
    description TEXT,
    url VARCHAR(512)
);

INSERT INTO legislation_document (document_name, document_number, issue_date, document_type, issuing_authority, description, url) VALUES
    ('Про охорону навколишнього природного середовища', '1264-XII', '1991-06-25', 'Закон України', 'Верховна Рада України', 'Основний закон про охорону навколишнього середовища', 'https://zakon.rada.gov.ua/laws/show/1264-12'),
    ('Про охорону атмосферного повітря', '2707-XII', '1992-10-16', 'Закон України', 'Верховна Рада України', 'Закон про захист повітря від забруднення', 'https://zakon.rada.gov.ua/laws/show/2707-12'),
    ('Про відходи', '187/98-ВР', '1998-03-05', 'Закон України', 'Верховна Рада України', 'Закон про поводження з відходами', 'https://zakon.rada.gov.ua/laws/show/187/98-вр'),
    ('Про енергозбереження', '74/94-ВР', '1994-07-01', 'Закон України', 'Верховна Рада України', 'Закон про енергозбереження та енергоефективність', 'https://zakon.rada.gov.ua/laws/show/74/94-вр'),
    ('Водний кодекс України', '213/95-ВР', '1995-06-06', 'Кодекс', 'Верховна Рада України', 'Кодекс про використання водних ресурсів', 'https://zakon.rada.gov.ua/laws/show/213/95-вр'),
    ('Земельний кодекс України', '2768-III', '2001-10-25', 'Кодекс', 'Верховна Рада України', 'Кодекс про використання земельних ресурсів', 'https://zakon.rada.gov.ua/laws/show/2768-14'),
    ('Про забезпечення санітарного та епідемічного благополуччя населення', '4004-XII', '1994-02-24', 'Закон України', 'Верховна Рада України', 'Закон про санітарне та епідемічне благополуччя', 'https://zakon.rada.gov.ua/laws/show/4004-12'),
    ('Про оцінку впливу на довкілля', '2059-VIII', '2017-05-23', 'Закон України', 'Верховна Рада України', 'Закон про оцінку впливу на довкілля', 'https://zakon.rada.gov.ua/laws/show/2059-19');

-- Таблица заходов (мероприятий)
CREATE TABLE IF NOT EXISTS eco_measure (
    id SERIAL PRIMARY KEY,
    category_id INT NOT NULL,
    measure_name VARCHAR(255) NOT NULL,
    description TEXT,
    implementation_time VARCHAR(100), -- Время, необходимое для реализации
    estimated_cost DECIMAL(15, 2), -- Ориентировочная стоимость
    unit_of_measure VARCHAR(50), -- Единица измерения (например, "тыс. грн")
    effectiveness_description TEXT, -- Описание эффективности мероприятия
    FOREIGN KEY (category_id) REFERENCES measure_category (id) ON DELETE CASCADE
);

INSERT INTO eco_measure (category_id, measure_name, description, implementation_time, estimated_cost, unit_of_measure, effectiveness_description) VALUES
    -- Охорона атмосферного повітря
    (1, 'Встановлення сучасних фільтрів на промислових підприємствах', 'Встановлення високоефективних фільтрів для зменшення викидів забруднюючих речовин', '6-12 місяців', 2500000.00, 'грн', 'Зменшення викидів шкідливих речовин на 70-90%'),
    (1, 'Модернізація газоочисного обладнання', 'Заміна застарілого газоочисного обладнання на сучасне', '3-9 місяців', 1800000.00, 'грн', 'Зниження концентрації шкідливих речовин у викидах на 60-75%'),
    (1, 'Розвиток громадського транспорту та велоруху', 'Створення умов для зручного використання громадського транспорту та велоінфраструктури', '12-24 місяці', 5000000.00, 'грн', 'Зменшення викидів CO2 на 15-20% за рахунок зменшення кількості приватних автомобілів'),
    
    -- Охорона водних ресурсів
    (2, 'Очистка та ремонт споруд на водоймах', 'Проведення очисних робіт на водоймах та ремонт гідротехнічних споруд', '3-6 місяців', 1200000.00, 'грн', 'Покращення якості води на 30-40%'),
    (2, 'Модернізація очисних споруд стічних вод', 'Впровадження сучасних технологій очистки стічних вод', '6-18 місяців', 4500000.00, 'грн', 'Підвищення ефективності очистки стоків до 95-98%'),
    (2, 'Будівництво дощової каналізації', 'Створення системи дощової каналізації з елементами очистки', '12-24 місяці', 3200000.00, 'грн', 'Запобігання потрапляння забруднених стоків до водойм на 80-90%'),
    
    -- Охорона ґрунтів
    (3, 'Рекультивація порушених земель', 'Відновлення порушених земель та підвищення їх родючості', '12-36 місяців', 850000.00, 'грн', 'Відновлення родючості ґрунтів на площі до 100 га'),
    (3, 'Впровадження органічного землеробства', 'Перехід на органічне землеробство без використання хімічних добрив', '24-48 місяців', 1200000.00, 'грн', 'Підвищення якості ґрунтів та екологічної чистоти продукції'),
    (3, 'Відновлення полезахисних лісосмуг', 'Відновлення наявних та створення нових лісосмуг для захисту ґрунтів', '12-24 місяці', 950000.00, 'грн', 'Зменшення ерозії ґрунтів на 40-60%'),
    
    -- Енергоефективність
    (4, 'Термомодернізація будівель', 'Утеплення фасадів, заміна вікон, модернізація систем опалення', '3-12 місяців', 3500000.00, 'грн', 'Економія енергоресурсів на 30-50%'),
    (4, 'Встановлення енергоефективного освітлення', 'Заміна застарілих освітлювальних приладів на LED-освітлення', '1-3 місяці', 800000.00, 'грн', 'Зниження споживання електроенергії на освітлення на 60-80%'),
    (4, 'Впровадження відновлюваних джерел енергії', 'Встановлення сонячних панелей та вітрогенераторів', '6-12 місяців', 4200000.00, 'грн', 'Зниження залежності від традиційних джерел енергії на 20-40%'),
    
    -- Поводження з відходами
    (5, 'Впровадження системи роздільного збору відходів', 'Створення інфраструктури для роздільного збору та переробки відходів', '6-18 місяців', 2800000.00, 'грн', 'Зменшення обсягу відходів на полігонах на 30-50%'),
    (5, 'Будівництво сміттєпереробного комплексу', 'Створення сучасного комплексу з переробки твердих побутових відходів', '18-36 місяців', 28000000.00, 'грн', 'Переробка до 80% відходів та отримання вторинної сировини'),
    (5, 'Ліквідація несанкціонованих звалищ', 'Виявлення та ліквідація несанкціонованих звалищ з рекультивацією території', '3-12 місяців', 1500000.00, 'грн', 'Зменшення забруднення ґрунтів та підземних вод'),
    
    -- Екологічна освіта
    (6, 'Проведення еко-освітніх заходів у школах', 'Організація уроків, семінарів та екскурсій з екологічної тематики', '6-12 місяців', 350000.00, 'грн', 'Підвищення екологічної свідомості молоді'),
    (6, 'Інформаційні кампанії з екологічної тематики', 'Розробка та поширення соціальної реклами, брошур, проведення акцій', '3-12 місяців', 650000.00, 'грн', 'Підвищення екологічної обізнаності населення'),
    (6, 'Організація еко-фестивалів', 'Проведення громадських заходів екологічної спрямованості', '1-3 місяці', 420000.00, 'грн', 'Залучення громадськості до екологічних ініціатив'),
    
    -- Економічний розвиток
    (7, 'Підтримка екологічно чистих виробництв', 'Надання пільг та допомоги підприємствам з екологічно чистими технологіями', '12-36 місяців', 5500000.00, 'грн', 'Створення нових робочих місць та зменшення впливу на довкілля'),
    (7, 'Розвиток зеленого туризму', 'Створення інфраструктури та підтримка об''єктів зеленого туризму', '12-24 місяці', 3800000.00, 'грн', 'Збільшення туристичного потоку та доходів місцевих громад'),
    (7, 'Підтримка органічного сільського господарства', 'Допомога фермерам у переході на органічне виробництво', '24-48 місяців', 4200000.00, 'грн', 'Покращення якості продукції та зменшення забруднення ґрунтів'),
    
    -- Охорона здоров'я
    (8, 'Моніторинг стану здоров''я населення екологічно небезпечних регіонів', 'Проведення регулярних медичних обстежень населення', '12-36 місяців', 950000.00, 'грн', 'Раннє виявлення та профілактика захворювань'),
    (8, 'Створення рекреаційних зон', 'Облаштування парків та зон відпочинку з чистим повітрям', '12-24 місяці', 3200000.00, 'грн', 'Покращення умов відпочинку та оздоровлення населення'),
    (8, 'Інформаційні кампанії про здоровий спосіб життя', 'Просвітницька робота щодо впливу екології на здоров''я', '6-12 місяців', 580000.00, 'грн', 'Підвищення обізнаності населення про екологічні ризики');

-- Ресурсы, необходимые для реализации заходов
CREATE TABLE IF NOT EXISTS measure_resource (
    id SERIAL PRIMARY KEY,
    measure_id INT NOT NULL,
    resource_name VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100) NOT NULL, -- материальный, человеческий, финансовый
    quantity DECIMAL(10, 2),
    unit VARCHAR(50),
    cost_per_unit DECIMAL(12, 2),
    total_cost DECIMAL(15, 2),
    FOREIGN KEY (measure_id) REFERENCES eco_measure (id) ON DELETE CASCADE
);

INSERT INTO measure_resource (measure_id, resource_name, resource_type, quantity, unit, cost_per_unit, total_cost)
VALUES 
    -- 1. Охорона атмосферного повітря
    (1, 'Високоефективні фільтри', 'Матеріал', 50, 'шт', 50000.00, 2500000.00), -- Встановлення фільтрів
    (2, 'Газоочисне обладнання', 'Обладнання', 10, 'шт', 180000.00, 1800000.00), -- Модернізація обладнання
    (3, 'Електробуси', 'Транспорт', 20, 'шт', 250000.00, 5000000.00), -- Розвиток громадського транспорту
    
    -- 2. Охорона водних ресурсів
    (4, 'Очисне обладнання', 'Обладнання', 5, 'шт', 240000.00, 1200000.00), -- Очистка водойм
    (5, 'Модулі очистки стоків', 'Обладнання', 15, 'шт', 300000.00, 4500000.00), -- Модернізація очисних споруд
    (6, 'Труби для каналізації', 'Матеріал', 2000, 'м', 1600.00, 3200000.00), -- Будівництво дощової каналізації
    
    -- 3. Охорона ґрунтів
    (7, 'Органічні добрива', 'Матеріал', 10000, 'кг', 85.00, 850000.00), -- Рекультивація земель
    (8, 'Сільгосптехніка', 'Обладнання', 5, 'шт', 240000.00, 1200000.00), -- Органічне землеробство
    (9, 'Саджанці дерев', 'Матеріал', 5000, 'шт', 190.00, 950000.00), -- Відновлення лісосмуг
    
    -- 4. Енергоефективність
    (10, 'Утеплювач', 'Матеріал', 10000, 'м²', 350.00, 3500000.00), -- Термомодернізація будівель
    (11, 'LED-лампи', 'Матеріал', 2000, 'шт', 400.00, 800000.00), -- Енергоефективне освітлення
    (12, 'Сонячні панелі', 'Обладнання', 50, 'шт', 84000.00, 4200000.00), -- Відновлювані джерела енергії
    
    -- 5. Поводження з відходами
    (13, 'Контейнери для сортування', 'Матеріал', 500, 'шт', 5600.00, 2800000.00), -- Роздільний збір відходів
    (14, 'Сміттєпереробний завод', 'Обладнання', 1, 'шт', 28000000.00, 28000000.00), -- Сміттєпереробний комплекс
    (15, 'Техніка для рекультивації', 'Обладнання', 3, 'шт', 500000.00, 1500000.00), -- Ліквідація звалищ
    
    -- 6. Екологічна освіта
    (16, 'Навчальні матеріали', 'Матеріал', 10000, 'шт', 35.00, 350000.00), -- Еко-освіта у школах
    (17, 'Рекламні банери', 'Матеріал', 200, 'шт', 3250.00, 650000.00), -- Інформаційні кампанії
    (18, 'Обладнання для фестивалів', 'Обладнання', 10, 'шт', 42000.00, 420000.00), -- Еко-фестивалі
    
    -- 7. Економічний розвиток
    (19, 'Технологічне обладнання', 'Обладнання', 10, 'шт', 550000.00, 5500000.00), -- Підтримка еко-виробництв
    (20, 'Інфраструктура туризму', 'Матеріал', 100, 'одиниць', 38000.00, 3800000.00), -- Зелений туризм
    (21, 'Органічні насіння', 'Матеріал', 20000, 'кг', 210.00, 4200000.00), -- Органічне сільське господарство
    
    -- 8. Охорона здоров’я
    (22, 'Медичне обладнання', 'Обладнання', 5, 'шт', 190000.00, 950000.00), -- Моніторинг здоров’я
    (23, 'Лавки та озеленення', 'Матеріал', 200, 'шт', 16000.00, 3200000.00), -- Рекреаційні зони
    (24, 'Інформаційні буклети', 'Матеріал', 50000, 'шт', 11.60, 580000.00); -- Кампанії про здоровий спосіб життя

-- Связь между законодательными документами и заходами
CREATE TABLE IF NOT EXISTS measure_legislation (
    measure_id INT NOT NULL,
    legislation_id INT NOT NULL,
    PRIMARY KEY (measure_id, legislation_id),
    FOREIGN KEY (measure_id) REFERENCES eco_measure (id) ON DELETE CASCADE,
    FOREIGN KEY (legislation_id) REFERENCES legislation_document (id) ON DELETE CASCADE
);

INSERT INTO measure_legislation (measure_id, legislation_id) VALUES
    (1, 2), -- Фільтри - Закон про охорону атмосферного повітря
    (1, 1), -- Фільтри - Закон про охорону навколишнього середовища
    (2, 2), -- Модернізація газоочисного обладнання - Закон про охорону атмосферного повітря
    (2, 1), -- Модернізація газоочисного обладнання - Закон про охорону навколишнього середовища
    (3, 2), -- Розвиток громадського транспорту - Закон про охорону атмосферного повітря
    
    (4, 5), -- Очистка водойм - Водний кодекс
    (4, 1), -- Очистка водойм - Закон про охорону навколишнього середовища
    (5, 5), -- Модернізація очисних споруд - Водний кодекс
    (5, 1), -- Модернізація очисних споруд - Закон про охорону навколишнього середовища
    (6, 5), -- Будівництво дощової каналізації - Водний кодекс
    
    (7, 6), -- Рекультивація земель - Земельний кодекс
    (7, 1), -- Рекультивація земель - Закон про охорону навколишнього середовища
    (8, 6), -- Органічне землеробство - Земельний кодекс
    (9, 6), -- Відновлення лісосмуг - Земельний кодекс
    
    (10, 4), -- Термомодернізація - Закон про енергозбереження
    (11, 4), -- Енергоефективне освітлення - Закон про енергозбереження
    (12, 4), -- Відновлювані джерела - Закон про енергозбереження
    
    (13, 3), -- Роздільний збір - Закон про відходи
    (13, 1), -- Роздільний збір - Закон про охорону навколишнього середовища
    (14, 3), -- Сміттєпереробний комплекс - Закон про відходи
    (15, 3), -- Ліквідація звалищ - Закон про відходи
    (15, 1), -- Ліквідація звалищ - Закон про охорону навколишнього середовища
    
    (16, 1), -- Еко-освіта у школах - Закон про охорону навколишнього середовища
    (17, 1), -- Інформаційні кампанії - Закон про охорону навколишнього середовища
    (18, 1), -- Еко-фестивалі - Закон про охорону навколишнього середовища
    
    (19, 1), -- Підтримка еко-виробництв - Закон про охорону навколишнього середовища
    (19, 8), -- Підтримка еко-виробництв - Закон про оцінку впливу на довкілля
    (20, 1), -- Зелений туризм - Закон про охорону навколишнього середовища
    (21, 6), -- Органічне сільське господарство - Земельний кодекс
    
    (22, 7), -- Моніторинг здоров'я - Закон про санітарне благополуччя
    (22, 1), -- Моніторинг здоров'я - Закон про охорону навколишнього середовища
    (23, 1), -- Рекреаційні зони - Закон про охорону навколишнього середовища
    (24, 7); -- Кампанії про здоровий спосіб життя - Закон про санітарне благополуччя

-- Таблица для хранения выбранных заходов для конкретных объектов
CREATE TABLE IF NOT EXISTS factory_measure (
    id SERIAL PRIMARY KEY,
    factory_id INT NOT NULL,
    measure_id INT NOT NULL,
    priority INT, -- приоритет мероприятия
    status VARCHAR(50), -- статус: планируется, в процессе, завершено
    start_date DATE,
    planned_end_date DATE,
    actual_end_date DATE,
    notes TEXT,
    FOREIGN KEY (factory_id) REFERENCES eco_factory (id) ON DELETE CASCADE,
    FOREIGN KEY (measure_id) REFERENCES eco_measure (id) ON DELETE CASCADE
);

INSERT INTO factory_measure (factory_id, measure_id, priority, status, start_date, planned_end_date, actual_end_date)
VALUES 
    -- Сонячна Фабрика (4): Якість води (4-6), Стан ґрунтів (7-9)
    (4, 4, 2, 'завершено', '2024-06-01', '2024-12-01', '2024-11-15'), -- Очистка водойм (3-6 месяцев)
    (4, 7, 1, 'в процессе', '2024-09-01', '2025-09-01', NULL), -- Рекультивація земель (12-36 месяцев)
    
    -- Біо-Ресурс (3): Стан ґрунтів (7-9)
    (3, 8, 3, 'планируется', '2025-04-01', '2027-04-01', NULL), -- Органічне землеробство (24-48 месяцев)
    
    -- ХімПром Безпека (9): Якість води (4-6), Стан ґрунтів (7-9), Економічний стан (19-21)
    (9, 5, 1, 'в процессе', '2024-07-01', '2025-01-01', NULL), -- Модернізація очисних споруд (6-18 месяцев)
    (9, 9, 2, 'планируется', '2025-06-01', '2026-06-01', NULL), -- Відновлення лісосмуг (12-24 месяца)
    (9, 19, 3, 'завершено', '2023-01-01', '2024-01-01', '2023-12-20'), -- Підтримка еко-виробництв (12-36 месяцев)
    
    -- Водний Світ (5): Економічний стан (19-21), Стан здоров’я (22-24)
    (5, 20, 2, 'в процессе', '2024-05-01', '2025-05-01', NULL), -- Зелений туризм (12-24 месяца)
    (5, 22, 1, 'планируется', '2025-03-15', '2026-03-15', NULL), -- Моніторинг здоров’я (12-36 месяцев)
    
    -- ЕкоБуд Технології (10): Стан ґрунтів (7-9), Енергетичний стан (10-12)
    (10, 7, 1, 'завершено', '2024-03-01', '2025-03-01', '2025-02-20'), -- Рекультивація земель (12-36 месяцев)
    (10, 11, 3, 'в процессе', '2025-01-01', '2025-04-01', NULL), -- Енергоефективне освітлення (1-3 месяца)
    
    -- Зелена Енергія (2): Якість повітря (1-3), Якість води (4-6), Стан ґрунтів (7-9)
    (2, 1, 2, 'завершено', '2024-04-01', '2024-10-01', '2024-09-25'), -- Фільтри на підприємствах (6-12 месяцев)
    (2, 6, 1, 'в процессе', '2024-08-01', '2025-08-01', NULL), -- Дощова каналізація (12-24 месяца)
    (2, 8, 3, 'планируется', '2025-05-01', '2027-05-01', NULL), -- Органічне землеробство (24-48 месяцев)
    
    -- Металургічний Завод ЕКО (7): Економічний стан (19-21), Енергетичний стан (10-12)
    (7, 21, 2, 'в процессе', '2024-06-01', '2026-06-01', NULL), -- Органічне сільське господарство (24-48 месяцев)
    (7, 12, 1, 'завершено', '2024-05-01', '2024-11-01', '2024-10-30'), -- Відновлювані джерела (6-12 месяцев)
    
    -- Сільськогосподарський Центр (6): Стан здоров’я (22-24), Енергетичний стан (10-12)
    (6, 23, 3, 'планируется', '2025-04-01', '2026-04-01', NULL), -- Рекреаційні зони (12-24 месяца)
    (6, 10, 2, 'в процессе', '2024-10-01', '2025-04-01', NULL), -- Термомодернізація (3-12 месяцев)
    
    -- Екологічна Теплоенергія (8): Якість повітря (1-3), Стан ґрунтів (7-9), Стан здоров’я (22-24)
    (8, 2, 1, 'завершено', '2024-03-01', '2024-09-01', '2024-08-15'), -- Модернізація газоочисного (3-9 месяцев)
    (8, 9, 2, 'в процессе', '2024-07-01', '2025-07-01', NULL), -- Відновлення лісосмуг (12-24 месяца)
    (8, 24, 3, 'планируется', '2025-03-01', '2025-09-01', NULL); -- Кампанії про здоровий спосіб життя (6-12 месяцев) 

    -- ЕкоТех Пром (1): Якість повітря (1-3), Енергетичний стан (10-12)
    (1, 3, 2, 'в процессе', '2024-10-01', '2025-10-01', NULL), -- Розвиток громадського транспорту
    (1, 10, 1, 'завершено', '2024-05-01', '2024-11-01', '2024-10-25'), -- Термомодернізація

-- Таблица для хранения региональных программ (наборов заходов для региона)
CREATE TABLE IF NOT EXISTS regional_program (
    id SERIAL PRIMARY KEY,
    program_name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50),
    total_budget DECIMAL(15, 2),
    created_by VARCHAR(100), -- имя эксперта, создавшего программу
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Заполнение таблицы regional_program демонстрационными данными
INSERT INTO regional_program (program_name, description, start_date, end_date, status, total_budget, created_by, created_at) VALUES 
    (
        'Програма екологічної модернізації м. Києва на 2024-2026 роки',
        'Комплексна програма покращення екологічного стану міста Києва шляхом впровадження сучасних технологій та заходів. Програма спрямована на зменшення забруднення повітря, водних ресурсів та ґрунтів, а також підвищення енергоефективності.',
        '2024-01-01',
        '2026-12-31',
        'планується',
        150000000.00,
        'Іванов О.П., Головний еколог міста',
        '2023-12-15 10:30:00'
    ),
    (
        'Програма енергетичної ефективності Київської області на 2024-2025 роки',
        'Програма заходів, спрямована на підвищення енергоефективності будівель, впровадження відновлюваних джерел енергії та зменшення споживання енергоресурсів у Київській області.',
        '2024-01-01',
        '2025-12-31',
        'планується',
        65000000.00,
        'Петренко В.А., Експерт з енергетики',
        '2023-12-10 14:15:00'
    ),
    (
        'Програма захисту водних ресурсів Дніпровського басейну на 2024-2027 роки',
        'Програма з охорони та відновлення водних ресурсів Дніпровського басейну. Передбачає комплекс заходів щодо очищення води, модернізації очисних споруд, відновлення прибережних екосистем.',
        '2024-03-01',
        '2027-02-28',
        'планується',
        95000000.00,
        'Ковальчук М.М., Керівник управління водних ресурсів',
        '2023-11-20 09:45:00'
    ),
    (
        'Програма розвитку зеленої енергетики Харківської області на 2024-2028 роки',
        'Стратегічна програма з розвитку відновлюваних джерел енергії у Харківській області. Включає будівництво сонячних та вітрових електростанцій, впровадження систем накопичення енергії, розвиток розумних мереж.',
        '2024-04-01',
        '2028-03-31',
        'планується',
        210000000.00,
        'Шевченко І.В., Енергетичний менеджер області',
        '2023-10-25 11:20:00'
    ),
    (
        'Програма зменшення промислового забруднення повітря Запорізької області на 2024-2026 роки',
        'Комплексна програма заходів із зменшення викидів шкідливих речовин у повітря від промислових підприємств Запорізької області. Передбачає встановлення фільтрів, модернізацію виробництва, впровадження чистих технологій.',
        '2024-02-01',
        '2026-01-31',
        'планується',
        85000000.00,
        'Сидоренко О.М., Головний еколог області',
        '2023-11-15 13:40:00'
    ),
    (
        'Програма розвитку переробки відходів в Одеській області на 2024-2026 роки',
        'Програма спрямована на вирішення проблеми утилізації відходів в Одеській області шляхом будівництва сміттєпереробних заводів, впровадження системи роздільного збору сміття та підвищення екологічної свідомості населення.',
        '2024-03-15',
        '2026-03-14',
        'планується',
        120000000.00,
        'Мельник К.С., Керівник департаменту екології',
        '2023-12-05 15:30:00'
    ),
    (
        'Програма відновлення лісових масивів Карпатського регіону на 2024-2029 роки',
        'Довгострокова програма з відновлення лісів у Карпатському регіоні, спрямована на боротьбу з вирубкою лісів, запобігання ерозії ґрунтів та повеней, збереження біорізноманіття.',
        '2024-04-15',
        '2029-04-14',
        'планується',
        180000000.00,
        'Карпенко Т.В., Голова управління лісового господарства',
        '2023-11-30 10:10:00'
    ),
    (
        'Програма екологічної освіти та виховання населення Львівської області на 2024-2025 роки',
        'Освітньо-просвітницька програма, спрямована на підвищення екологічної свідомості населення Львівської області шляхом проведення тренінгів, семінарів, фестивалів та інформаційних кампаній.',
        '2024-01-15',
        '2025-12-31',
        'затверджено',
        25000000.00,
        'Бондаренко Л.І., Керівник департаменту освіти',
        '2023-12-18 12:00:00'
    ),
    (
        'Програма моніторингу та покращення якості ґрунтів сільськогосподарських угідь на 2024-2027 роки',
        'Програма з моніторингу стану ґрунтів, впровадження органічного землеробства, рекультивації порушених земель та запобігання ерозії ґрунтів у сільськогосподарських регіонах України.',
        '2024-05-01',
        '2027-04-30',
        'планується',
        75000000.00,
        'Коваленко О.О., Експерт з агроекології',
        '2023-11-25 09:30:00'
    ),
    (
        'Програма оздоровлення басейну річки Південний Буг на 2024-2028 роки',
        'Комплексна програма з оздоровлення річки Південний Буг та її приток, що включає очищення русла, модернізацію очисних споруд, відновлення водного біорізноманіття та забезпечення якісного водопостачання прилеглих територій.',
        '2024-06-01',
        '2028-05-31',
        'планується',
        135000000.00,
        'Григоренко В.С., Керівник водного господарства',
        '2023-12-12 14:45:00'
    );

-- Таблица для связи региональных программ с заходами
CREATE TABLE IF NOT EXISTS program_measure (
    program_id INT NOT NULL,
    measure_id INT NOT NULL,
    priority INT, -- приоритет мероприятия в программе
    budget_allocation DECIMAL(15, 2), -- выделенный бюджет
    planned_start_date DATE,
    planned_end_date DATE,
    notes TEXT,
    PRIMARY KEY (program_id, measure_id),
    FOREIGN KEY (program_id) REFERENCES regional_program (id) ON DELETE CASCADE,
    FOREIGN KEY (measure_id) REFERENCES eco_measure (id) ON DELETE CASCADE
);

INSERT INTO program_measure (program_id, measure_id, priority, budget_allocation, planned_start_date, planned_end_date, notes)
VALUES 
    -- 1. Програма екологічної модернізації м. Києва (воздух, вода, грунты, энергоэффективность)
    (1, 1, 1, 2500000.00, '2024-03-01', '2024-09-01', 'Встановлення фільтрів на ключових підприємствах міста'),
    (1, 5, 2, 4500000.00, '2024-06-01', '2025-06-01', 'Модернізація очисних споруд у центральних районах'),
    (1, 7, 2, 850000.00, '2024-05-01', '2025-05-01', 'Рекультивація земель у промислових зонах'),
    (1, 10, 1, 3500000.00, '2024-02-01', '2024-12-01', 'Термомодернізація муніципальних будівель'),

    -- 2. Програма енергетичної ефективності Київської області (энергоэффективность)
    (2, 11, 1, 800000.00, '2024-02-01', '2024-05-01', 'Заміна освітлення в школах та лікарнях'),
    (2, 12, 2, 4200000.00, '2024-03-01', '2024-09-01', 'Встановлення сонячних панелей на адмінбудівлях'),

    -- 3. Захист водних ресурсів Дніпровського басейну (вода)
    (3, 4, 2, 1200000.00, '2024-04-01', '2024-10-01', 'Очистка малих річок басейну'),
    (3, 6, 1, 3200000.00, '2024-06-01', '2025-06-01', 'Будівництво дощової каналізації в прибережних зонах'),

    -- 4. Розвиток зеленої енергетики Харківської області (энергоэффективность)
    (4, 12, 1, 4200000.00, '2024-05-01', '2024-11-01', 'Будівництво сонячної станції в північній частині області'),
    (4, 10, 2, 3500000.00, '2024-06-01', '2025-06-01', 'Термомодернізація житлових будинків'),

    -- 5. Зменшення промислового забруднення повітря Запорізької області (воздух)
    (5, 2, 1, 1800000.00, '2024-03-01', '2024-09-01', 'Модернізація обладнання на металургійних заводах'),
    (5, 1, 2, 2500000.00, '2024-04-01', '2024-10-01', 'Встановлення фільтрів на хімічних підприємствах'),

    -- 6. Розвиток переробки відходів Одеської області (отходы)
    (6, 13, 2, 2800000.00, '2024-04-01', '2025-04-01', 'Впровадження роздільного збору в містах'),
    (6, 14, 1, 28000000.00, '2024-06-01', '2026-06-01', 'Будівництво сміттєпереробного комплексу в Одесі'),

    -- 7. Відновлення лісових масивів Карпатського регіону (грунты)
    (7, 9, 1, 950000.00, '2024-05-01', '2025-05-01', 'Відновлення лісосмуг у передгір’ях'),
    (7, 7, 2, 850000.00, '2024-06-01', '2025-06-01', 'Рекультивація земель після вирубки'),

    -- 8. Екологічна освіта Львівської області (экологическое образование)
    (8, 16, 1, 350000.00, '2024-02-01', '2024-08-01', 'Проведення еко-уроків у школах'),
    (8, 17, 2, 650000.00, '2024-03-01', '2024-09-01', 'Інформаційна кампанія в громадах'),

    -- 9. Моніторинг та покращення якості ґрунтів (грунты)
    (9, 8, 1, 1200000.00, '2024-06-01', '2026-06-01', 'Перехід ферм на органічне землеробство'),
    (9, 7, 2, 850000.00, '2024-07-01', '2025-07-01', 'Рекультивація земель у сільгоспзонах'),

    -- 10. Оздоровлення басейну Південний Буг (вода)
    (10, 5, 1, 4500000.00, '2024-07-01', '2025-07-01', 'Модернізація очисних споруд уздовж річки'),
    (10, 4, 2, 1200000.00, '2024-08-01', '2025-02-01', 'Очистка приток Південного Бугу');