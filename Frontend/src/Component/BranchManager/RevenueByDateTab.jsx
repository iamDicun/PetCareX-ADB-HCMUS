import { useState, useEffect } from 'react';
import axios from 'axios';

const RevenueByDateTab = ({ branchId }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [allData, setAllData] = useState([]);
    const [summary, setSummary] = useState(null);

    // Filter state
    const [fromDate, setFromDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return date.toISOString().split('T')[0];
    });
    const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Fetch revenue data
    const fetchRevenueData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await axios.get('/api/branch/revenue-by-date', {
                params: {
                    branchId: branchId,
                    fromDate: fromDate,
                    toDate: toDate
                }
            });

            setAllData(response.data.data || []);
            setSummary(response.data.summary || {});
            
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải dữ liệu doanh thu');
            console.error('Error fetching revenue:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRevenueData();
    }, []);

    // Phân trang client-side
    const revenueData = allData.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
    const totalPages = Math.ceil(allData.length / rowsPerPage);

    const handleChangePage = (newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    const handleSearch = () => {
        setPage(0);
        fetchRevenueData();
    };

    const formatCurrency = (value) => {
        if (!value) return '0 đ';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    // Styles
    const containerStyle = {
        padding: '20px',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh'
    };

    const headerStyle = {
        marginBottom: '20px',
        color: '#333'
    };

    const filterBoxStyle = {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    };

    const filterRowStyle = {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '15px',
        alignItems: 'end'
    };

    const inputGroupStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    };

    const labelStyle = {
        fontSize: '14px',
        fontWeight: '500',
        color: '#555'
    };

    const inputStyle = {
        padding: '8px 12px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px'
    };

    const buttonStyle = {
        padding: '10px 20px',
        backgroundColor: '#1976d2',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500'
    };

    const summaryBoxStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '15px',
        marginBottom: '20px'
    };

    const summaryCardStyle = (bgColor) => ({
        backgroundColor: bgColor,
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    });

    const summaryLabelStyle = {
        fontSize: '14px',
        color: '#666',
        marginBottom: '8px'
    };

    const summaryValueStyle = (color) => ({
        fontSize: '24px',
        fontWeight: 'bold',
        color: color,
        marginBottom: '4px'
    });

    const tableContainerStyle = {
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden'
    };

    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse'
    };

    const thStyle = {
        backgroundColor: '#f5f5f5',
        padding: '12px',
        textAlign: 'left',
        fontWeight: '600',
        borderBottom: '2px solid #ddd'
    };

    const tdStyle = {
        padding: '12px',
        borderBottom: '1px solid #eee'
    };

    const paginationStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 20px',
        backgroundColor: 'white',
        borderTop: '1px solid #eee'
    };

    const paginationButtonStyle = (disabled) => ({
        padding: '6px 12px',
        margin: '0 4px',
        border: '1px solid #ddd',
        backgroundColor: disabled ? '#f5f5f5' : 'white',
        cursor: disabled ? 'not-allowed' : 'pointer',
        borderRadius: '4px',
        fontSize: '14px',
        opacity: disabled ? 0.5 : 1
    });

    const activePageStyle = {
        padding: '6px 12px',
        margin: '0 4px',
        border: '1px solid #1976d2',
        backgroundColor: '#1976d2',
        color: 'white',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: '500'
    };

    return (
        <div style={containerStyle}>
            <h2 style={headerStyle}>Doanh Thu Theo Ngày</h2>

            {/* Bộ lọc */}
            <div style={filterBoxStyle}>
                <div style={filterRowStyle}>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Từ ngày</label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            style={inputStyle}
                        />
                    </div>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Đến ngày</label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            style={inputStyle}
                        />
                    </div>
                    <button 
                        onClick={handleSearch}
                        disabled={loading}
                        style={buttonStyle}
                    >
                        {loading ? 'Đang tải...' : 'Tìm kiếm'}
                    </button>
                </div>
            </div>

            {/* Thông tin tổng quan */}
            {summary && (
                <div style={summaryBoxStyle}>
                    <div style={summaryCardStyle('#e3f2fd')}>
                        <div style={summaryLabelStyle}>Doanh Thu Dịch Vụ</div>
                        <div style={summaryValueStyle('#1976d2')}>
                            {formatCurrency(summary.totalService)}
                        </div>
                    </div>
                    <div style={summaryCardStyle('#f3e5f5')}>
                        <div style={summaryLabelStyle}>Doanh Thu Bán Hàng</div>
                        <div style={summaryValueStyle('#9c27b0')}>
                            {formatCurrency(summary.totalProduct)}
                        </div>
                    </div>
                    <div style={summaryCardStyle('#e8f5e9')}>
                        <div style={summaryLabelStyle}>Tổng Doanh Thu</div>
                        <div style={summaryValueStyle('#2e7d32')}>
                            {formatCurrency(summary.totalRevenue)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            {summary.totalInvoices} hóa đơn
                        </div>
                    </div>
                </div>
            )}

            {/* Thông báo lỗi */}
            {error && (
                <div style={{ 
                    backgroundColor: '#ffebee', 
                    color: '#c62828', 
                    padding: '15px', 
                    borderRadius: '4px',
                    marginBottom: '20px'
                }}>
                    {error}
                </div>
            )}

            {/* Bảng dữ liệu */}
            <div style={tableContainerStyle}>
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Ngày</th>
                            <th style={{...thStyle, textAlign: 'right'}}>Dịch Vụ</th>
                            <th style={{...thStyle, textAlign: 'right'}}>Bán Hàng</th>
                            <th style={{...thStyle, textAlign: 'right'}}>Tổng Doanh Thu</th>
                            <th style={{...thStyle, textAlign: 'center'}}>Số HĐ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" style={{...tdStyle, textAlign: 'center', padding: '40px'}}>
                                    Đang tải dữ liệu...
                                </td>
                            </tr>
                        ) : revenueData.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{...tdStyle, textAlign: 'center', padding: '40px', color: '#999'}}>
                                    Không có dữ liệu
                                </td>
                            </tr>
                        ) : (
                            revenueData.map((row, index) => (
                                <tr key={index} style={{ 
                                    backgroundColor: index % 2 === 0 ? 'white' : '#fafafa',
                                    transition: 'background-color 0.2s'
                                }}>
                                    <td style={tdStyle}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '4px 8px',
                                            backgroundColor: '#e0e0e0',
                                            borderRadius: '4px',
                                            fontSize: '13px'
                                        }}>
                                            {formatDate(row.Ngay)}
                                        </span>
                                    </td>
                                    <td style={{...tdStyle, textAlign: 'right'}}>
                                        {formatCurrency(row.DoanhThuDichVu)}
                                    </td>
                                    <td style={{...tdStyle, textAlign: 'right'}}>
                                        {formatCurrency(row.DoanhThuBanHang)}
                                    </td>
                                    <td style={{...tdStyle, textAlign: 'right'}}>
                                        <strong>{formatCurrency(row.TongDoanhThu)}</strong>
                                    </td>
                                    <td style={{...tdStyle, textAlign: 'center'}}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '4px 12px',
                                            backgroundColor: '#e3f2fd',
                                            color: '#1976d2',
                                            borderRadius: '12px',
                                            fontSize: '13px',
                                            fontWeight: '500'
                                        }}>
                                            {row.SoHoaDon}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                
                {/* Pagination */}
                {!loading && allData.length > 0 && (
                    <div style={paginationStyle}>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                            Hiển thị {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, allData.length)} trong tổng số {allData.length}
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ fontSize: '14px', color: '#666' }}>Số dòng:</label>
                            <select 
                                value={rowsPerPage} 
                                onChange={handleChangeRowsPerPage}
                                style={{...inputStyle, width: 'auto'}}
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                            
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <button
                                    onClick={() => handleChangePage(0)}
                                    disabled={page === 0}
                                    style={paginationButtonStyle(page === 0)}
                                >
                                    ««
                                </button>
                                <button
                                    onClick={() => handleChangePage(page - 1)}
                                    disabled={page === 0}
                                    style={paginationButtonStyle(page === 0)}
                                >
                                    ‹
                                </button>
                                
                                {[...Array(totalPages)].map((_, i) => {
                                    // Chỉ hiển thị 5 trang xung quanh trang hiện tại
                                    if (
                                        i === 0 || 
                                        i === totalPages - 1 || 
                                        (i >= page - 2 && i <= page + 2)
                                    ) {
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => handleChangePage(i)}
                                                style={i === page ? activePageStyle : paginationButtonStyle(false)}
                                            >
                                                {i + 1}
                                            </button>
                                        );
                                    } else if (i === page - 3 || i === page + 3) {
                                        return <span key={i} style={{ padding: '6px' }}>...</span>;
                                    }
                                    return null;
                                })}
                                
                                <button
                                    onClick={() => handleChangePage(page + 1)}
                                    disabled={page >= totalPages - 1}
                                    style={paginationButtonStyle(page >= totalPages - 1)}
                                >
                                    ›
                                </button>
                                <button
                                    onClick={() => handleChangePage(totalPages - 1)}
                                    disabled={page >= totalPages - 1}
                                    style={paginationButtonStyle(page >= totalPages - 1)}
                                >
                                    »»
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RevenueByDateTab;
