import { poolPromise } from '../Config/db.js';
import sql from 'mssql';

async function findByPhoneNum(sdt) {
    try {
        const pool = await poolPromise;
        
        const result = await pool.request()
            .input('sdt', sql.VarChar, sdt)
            .query('SELECT TOP 1 * FROM KhachHang WHERE SoDienThoai = @sdt');
        
        
        return result.recordset[0] || null;
    } catch (error) {
        console.error('[findByPhoneNum] Error:', error.message, error);
        throw error;
    }
}

export default {
    findByPhoneNum,
};