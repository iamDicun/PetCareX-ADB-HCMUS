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

        if (!TuNgay || !DenNgay) {
            return res.status(400).json({ 
                success: false, 
                message: 'Từ ngày và đến ngày là bắt buộc' 
            });
        }

        console.log('=== Revenue Request ===');
        console.log('MaChiNhanh:', MaChiNhanh);
        console.log('TuNgay:', TuNgay);
        console.log('DenNgay:', DenNgay);

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

// Xem thống kê dịch vụ hot (được đặt nhiều nhất)
const getHotServices = async (req, res) => {
    try {
        const { MaChiNhanh, TuNgay, DenNgay } = req.query;
        
        console.log('=== getHotServices Controller ===');
        console.log('Received params:', { MaChiNhanh, TuNgay, DenNgay });
        
        if (!MaChiNhanh) {
            return res.status(400).json({ 
                success: false, 
                message: 'Mã chi nhánh là bắt buộc' 
            });
        }

        const services = await branchService.getHotServices(
            MaChiNhanh, 
            TuNgay, 
            DenNgay
        );

        console.log('Services returned:', services?.length || 0, 'items');

        res.json({
            success: true,
            data: services
        });
    } catch (error) {
        console.error('Lỗi khi lấy thống kê dịch vụ:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server khi lấy thống kê dịch vụ',
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

// Lấy tất cả sản phẩm
const getAllProducts = async (req, res) => {
    try {
        const products = await branchService.getAllProducts();

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách sản phẩm:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server khi lấy danh sách sản phẩm',
            error: error.message 
        });
    }
};

// Tạo yêu cầu nhập hàng
const createImportRequest = async (req, res) => {
    try {
        const { MaChiNhanh, items } = req.body;
        
        if (!MaChiNhanh || !items || items.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Mã chi nhánh và danh sách sản phẩm là bắt buộc' 
            });
        }

        const result = await branchService.createImportRequest(MaChiNhanh, items);

        res.json({
            success: true,
            message: 'Tạo yêu cầu nhập hàng thành công',
            data: result
        });
    } catch (error) {
        console.error('Lỗi khi tạo yêu cầu nhập hàng:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server khi tạo yêu cầu nhập hàng',
            error: error.message 
        });
    }
};

// Lấy lịch sử yêu cầu nhập hàng
const getImportHistory = async (req, res) => {
    try {
        const { MaChiNhanh, page = 1, limit = 10 } = req.query;
        
        if (!MaChiNhanh) {
            return res.status(400).json({ 
                success: false, 
                message: 'Mã chi nhánh là bắt buộc' 
            });
        }

        const result = await branchService.getImportHistory(
            MaChiNhanh,
            parseInt(page),
            parseInt(limit)
        );

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Lỗi khi lấy lịch sử nhập hàng:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server khi lấy lịch sử nhập hàng',
            error: error.message 
        });
    }
};

// Lấy doanh thu thuốc
const getMedicineRevenue = async (req, res) => {
    try {
        const { MaChiNhanh, TuNgay, DenNgay } = req.query;
        
        if (!MaChiNhanh || !TuNgay || !DenNgay) {
            return res.status(400).json({ 
                success: false, 
                message: 'Thiếu thông tin bắt buộc' 
            });
        }

        const data = await branchService.getMedicineRevenue(MaChiNhanh, TuNgay, DenNgay);
        res.json({ success: true, data });
    } catch (error) {
        console.error('Lỗi khi lấy doanh thu thuốc:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server khi lấy doanh thu thuốc',
            error: error.message 
        });
    }
};

// Lấy doanh thu theo ngày (tất cả dữ liệu)
const getRevenueByDate = async (req, res) => {
    try {
        const { branchId, fromDate, toDate } = req.query;

        const result = await branchService.getRevenueByDate({
            branchId,
            fromDate,
            toDate
        });

        res.json({
            success: true,
            data: result.data,
            summary: result.summary
        });
    } catch (error) {
        console.error('Lỗi khi lấy doanh thu theo ngày:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy doanh thu theo ngày',
            error: error.message
        });
    }
};

// Lấy danh sách lịch hẹn theo ngày
const getAppointmentsByDate = async (req, res) => {
    try {
        const { branchCode, startDate, endDate } = req.query;

        const data = await branchService.getAppointmentsByDate({
            branchId: branchCode,
            fromDate: startDate,
            toDate: endDate
        });

        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error('Lỗi khi lấy lịch hẹn:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy lịch hẹn',
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
    getHotServices,
    getBranchInventory,
    getAllProducts,
    createImportRequest,
    getImportHistory,
    getMedicineRevenue,
    getRevenueByDate,
    getAppointmentsByDate
};
