import { poolPromise } from '../Config/db.js';
import sql from 'mssql';

async function findByPhoneNum(sdt) {
    try {
        const pool = await poolPromise;
        
        const result = await pool.request()
            .input('sdt', sql.VarChar, sdt)
            .query('SELECT TOP 1 * FROM NhanVien WHERE SoDienThoai = @sdt');
        
        
        return result.recordset[0] || null;
    } catch (error) {
        console.error('[findByPhoneNum] Error:', error.message, error);
        throw error;
    }
}

async function findCustomerId(name, phoneNum) {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .input('phoneNum', sql.VarChar, phoneNum)
            .query('SELECT MaKhachHang FROM KhachHang WHERE HoTen = @name AND SoDienThoai = @phoneNum');
        return result.recordset;
    } catch (error) {
        console.error('[findCustomerId] Error:', error.message, error);
        throw error;
    }
}
async function findCusPets(cusId) {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('cusId', sql.Int, cusId)
            .query('SELECT * FROM ThuCung WHERE MaKhachHang = @cusId');
        return result.recordset;
    } catch (error) {
        console.error('[findCusPets] Error:', error.message, error);
        throw error;
    }   
}

async function getServices() {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT * FROM DichVu');
        return result.recordset;
    } catch (error) {
        console.error('[getServices] Error:', error.message, error);
        throw error;
    }
}

export default {
    findByPhoneNum,
    findCustomerId,
    findCusPets,
    getServices,
};