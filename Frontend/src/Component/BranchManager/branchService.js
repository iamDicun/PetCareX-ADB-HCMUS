import axios from 'axios';

const API_URL = 'http://localhost:5000/api/branch';

// Lấy token từ localStorage
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
};

// Lấy doanh thu
export const fetchRevenue = async (MaChiNhanh, TuNgay, DenNgay) => {
    const response = await axios.get(`${API_URL}/revenue`, {
        ...getAuthHeaders(),
        params: { MaChiNhanh, TuNgay, DenNgay }
    });
    return response.data.data || [];
};

// Lấy danh sách đơn hàng
export const fetchOrders = async (MaChiNhanh, TuNgay, DenNgay, page = 1, limit = 10) => {
    const response = await axios.get(`${API_URL}/orders`, {
        ...getAuthHeaders(),
        params: { MaChiNhanh, TuNgay, DenNgay, page, limit }
    });
    return response.data;
};

// Lấy đánh giá nhân viên
export const fetchEmployeeRatings = async () => {
    const response = await axios.get(`${API_URL}/employee-ratings`, getAuthHeaders());
    return response.data.data || [];
};

// Lấy hiệu suất nhân viên
export const fetchEmployeePerformance = async (MaChiNhanh, TuNgay, DenNgay, page = 1, limit = 10) => {
    const response = await axios.get(`${API_URL}/employee-performance`, {
        ...getAuthHeaders(),
        params: { MaChiNhanh, TuNgay, DenNgay, page, limit }
    });
    return response.data;
};

// Lấy thống kê sản phẩm bán chạy
export const fetchTopProducts = async (MaChiNhanh, TuNgay, DenNgay) => {
    const response = await axios.get(`${API_URL}/top-products`, {
        ...getAuthHeaders(),
        params: { MaChiNhanh, TuNgay, DenNgay }
    });
    return response.data.data || [];
};

// Lấy tồn kho
export const fetchInventory = async (MaChiNhanh, page = 1, limit = 10) => {
    const response = await axios.get(`${API_URL}/inventory`, {
        ...getAuthHeaders(),
        params: { MaChiNhanh, page, limit }
    });
    return response.data;
};

// Lấy tất cả sản phẩm (không phân trang)
export const fetchAllProducts = async () => {
    const response = await axios.get(`${API_URL}/products`, getAuthHeaders());
    return response.data.data || [];
};

// Tạo yêu cầu nhập hàng
export const createImportRequest = async (MaChiNhanh, items) => {
    const response = await axios.post(`${API_URL}/import-request`, 
        { MaChiNhanh, items },
        getAuthHeaders()
    );
    return response.data;
};

// Lấy lịch sử yêu cầu nhập hàng
export const fetchImportHistory = async (MaChiNhanh, page = 1, limit = 10) => {
    const response = await axios.get(`${API_URL}/import-history`, {
        ...getAuthHeaders(),
        params: { MaChiNhanh, page, limit }
    });
    return response.data;
};
