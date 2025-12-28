import express from 'express';
import branchController from '../Controllers/branch.controller.js';
import authMiddleware from '../Middleware/auth.middleware.js';

const branchRouter = express.Router();

// Áp dụng middleware xác thực cho tất cả các routes
branchRouter.use(authMiddleware);

// Doanh thu chi nhánh theo dịch vụ và sản phẩm
branchRouter.get('/revenue', branchController.getRevenueByServiceAndProduct);

// Danh sách hóa đơn đặt hàng theo khoảng ngày
branchRouter.get('/orders', branchController.getOrdersByDateRange);

// Danh sách nhân viên và đánh giá
branchRouter.get('/employee-ratings', branchController.getEmployeeRatings);

// Hiệu suất làm việc của nhân viên
branchRouter.get('/employee-performance', branchController.getEmployeePerformance);

// Thống kê sản phẩm bán chạy
branchRouter.get('/top-products', branchController.getTopProducts);

// Thống kê dịch vụ hot (được đặt nhiều nhất)
branchRouter.get('/hot-services', branchController.getHotServices);

// Tồn kho của chi nhánh
branchRouter.get('/inventory', branchController.getBranchInventory);

// Lấy tất cả sản phẩm
branchRouter.get('/products', branchController.getAllProducts);

// Tạo yêu cầu nhập hàng
branchRouter.post('/import-request', branchController.createImportRequest);

// Lấy lịch sử yêu cầu nhập hàng
branchRouter.get('/import-history', branchController.getImportHistory);

branchRouter.get('/medicine-revenue', branchController.getMedicineRevenue);

// Doanh thu theo ngày (phân trang)
branchRouter.get('/revenue-by-date', branchController.getRevenueByDate);

// Lịch hẹn theo ngày
branchRouter.get('/appointments', branchController.getAppointmentsByDate);

export default branchRouter;
