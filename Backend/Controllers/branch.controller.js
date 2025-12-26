import branchService from '../Services/branch.service.js';

// Lấy doanh thu chi nhánh theo dịch vụ và sản phẩm
const getRevenueByServiceAndProduct = async (req, res) => {
    try {
        const { MaChiNhanh, TuNgay, DenNgay } = req.query;
        
        if (!MaChiNhanh) {
            return res.status(400).json({ 
                success: false, 
                message: 'Mã chi nhánh là bắt buộc' 
            });
        }

        const revenue = await branchService.getRevenueByServiceAndProduct(
            MaChiNhanh, 
            TuNgay, 
            DenNgay
        );

        res.json({
            success: true,
            data: revenue
        });
    } catch (error) {
        console.error('Lỗi khi lấy doanh thu chi nhánh:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server khi lấy doanh thu',
            error: error.message 
        });
    }
};

// Lấy danh sách hóa đơn đặt hàng theo khoảng ngày
const getOrdersByDateRange = async (req, res) => {
    try {
        const { MaChiNhanh, TuNgay, DenNgay, page = 1, limit = 10 } = req.query;
        
        if (!MaChiNhanh || !TuNgay || !DenNgay) {
            return res.status(400).json({ 
                success: false, 
                message: 'Mã chi nhánh, từ ngày và đến ngày là bắt buộc' 
            });
        }

        const result = await branchService.getOrdersByDateRange(
            MaChiNhanh, 
            TuNgay, 
            DenNgay,
            parseInt(page),
            parseInt(limit)
        );

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách đơn hàng:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server khi lấy danh sách đơn hàng',
            error: error.message 
        });
    }
};

// Xem danh sách nhân viên và đánh giá
const getEmployeeRatings = async (req, res) => {
    try {
        const ratings = await branchService.getEmployeeRatings();

        res.json({
            success: true,
            data: ratings
        });
    } catch (error) {
        console.error('Lỗi khi lấy đánh giá nhân viên:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server khi lấy đánh giá nhân viên',
            error: error.message 
        });
    }
};

// Xem hiệu suất làm việc của nhân viên
const getEmployeePerformance = async (req, res) => {
    try {
        const { MaChiNhanh, TuNgay, DenNgay, page = 1, limit = 10 } = req.query;
        
        if (!TuNgay || !DenNgay) {
            return res.status(400).json({ 
                success: false, 
                message: 'Từ ngày và đến ngày là bắt buộc' 
            });
        }

        // Get MaNhanVien from authenticated user
        const MaNhanVien = req.user?.MaNhanVien;
        if (!MaNhanVien) {
            return res.status(401).json({ 
                success: false, 
                message: 'Không tìm thấy thông tin người dùng' 
            });
        }

        const result = await branchService.getEmployeePerformance(
            MaNhanVien,
            MaChiNhanh, 
            TuNgay, 
            DenNgay,
            parseInt(page),
            parseInt(limit)
        );

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Lỗi khi lấy hiệu suất nhân viên:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server khi lấy hiệu suất nhân viên',
            error: error.message 
        });
    }
};

// Xem thống kê sản phẩm bán chạy
const getTopProducts = async (req, res) => {
    try {
        const { MaChiNhanh, TuNgay, DenNgay } = req.query;
        
        if (!MaChiNhanh) {
            return res.status(400).json({ 
                success: false, 
                message: 'Mã chi nhánh là bắt buộc' 
            });
        }

        const products = await branchService.getTopProducts(
            MaChiNhanh, 
            TuNgay, 
            DenNgay
        );

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Lỗi khi lấy thống kê sản phẩm:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server khi lấy thống kê sản phẩm',
            error: error.message 
        });
    }
};

// Xem tồn kho của chi nhánh
const getBranchInventory = async (req, res) => {
    try {
        const { MaChiNhanh, page = 1, limit = 10 } = req.query;
        
        if (!MaChiNhanh) {
            return res.status(400).json({ 
                success: false, 
                message: 'Mã chi nhánh là bắt buộc' 
            });
        }

        const result = await branchService.getBranchInventory(
            MaChiNhanh,
            parseInt(page),
            parseInt(limit)
        );

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Lỗi khi lấy tồn kho:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server khi lấy tồn kho',
            error: error.message 
        });
    }
};

export default {
    getRevenueByServiceAndProduct,
    getOrdersByDateRange,
    getEmployeeRatings,
    getEmployeePerformance,
    getTopProducts,
    getBranchInventory
};
