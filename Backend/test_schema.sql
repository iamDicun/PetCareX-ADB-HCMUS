-- Kiểm tra cấu trúc bảng ChiTietLichHen
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'ChiTietLichHen'
ORDER BY ORDINAL_POSITION;

-- Kiểm tra dữ liệu mẫu
SELECT TOP 5 * FROM ChiTietLichHen;

-- Kiểm tra có bao nhiêu record có MaBacSi
SELECT 
    COUNT(*) AS TongRecords,
    COUNT(MaBacSi) AS CoMaBacSi,
    COUNT(*) - COUNT(MaBacSi) AS KhongCoMaBacSi
FROM ChiTietLichHen;

-- Kiểm tra LichHen có cột gì liên quan đến bác sĩ không
SELECT 
    COLUMN_NAME,
    DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'LichHen'
  AND (COLUMN_NAME LIKE '%BacSi%' OR COLUMN_NAME LIKE '%NV%')
ORDER BY ORDINAL_POSITION;
