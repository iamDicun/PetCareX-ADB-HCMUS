import express from 'express';
const router = express.Router();
import companyManagerController from '../Controllers/companymanager.controller.js';

// SP f: Thống kê dịch vụ hot
router.get('/hot-services', companyManagerController.getHotServices);

// SP g: Doanh thu toàn hệ thống
router.get('/system-revenue', companyManagerController.getSystemRevenue);

// SP i: Top dịch vụ doanh thu cao nhất
router.get('/top-revenue-services', companyManagerController.getTopRevenueServices);

// SP e: Xem danh sách nhân viên và đánh giá
router.get('/employee-ratings', companyManagerController.getEmployeeRatings);

// SP k: Sản phẩm bán chạy
router.get('/best-selling-products', companyManagerController.getBestSellingProducts);

// Get all branches
router.get('/branches', companyManagerController.getAllBranches);

// Import requests management
router.get('/import-requests/pending', companyManagerController.getPendingImportRequests);
router.get('/import-requests/:requestId/details', companyManagerController.getImportRequestDetails);
router.post('/import-requests/:requestId/approve', companyManagerController.approveImportRequest);

// Employee transfer management
router.get('/employees', companyManagerController.getAllEmployees);
router.post('/employees/:employeeId/transfer', companyManagerController.transferEmployee);

export default router;
