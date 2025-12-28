import companyManagerService from '../Services/companymanager.service.js';

const companyManagerController = {
    // GET /api/company-manager/hot-services
    getHotServices: async (req, res) => {
        try {
            const { top = 10, fromDate, toDate } = req.query;
            const result = await companyManagerService.getHotServices(
                parseInt(top),
                fromDate || null,
                toDate || null
            );
            
            if (result.success) {
                res.json(result);
            } else {
                res.status(500).json(result);
            }
        } catch (error) {
            console.error('Error in getHotServices controller:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // GET /api/company-manager/system-revenue
    getSystemRevenue: async (req, res) => {
        try {
            const { year } = req.query;
            if (!year) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Year parameter is required' 
                });
            }
            
            const result = await companyManagerService.getSystemRevenue(parseInt(year));
            
            if (result.success) {
                res.json(result);
            } else {
                res.status(500).json(result);
            }
        } catch (error) {
            console.error('Error in getSystemRevenue controller:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // GET /api/company-manager/top-revenue-services
    getTopRevenueServices: async (req, res) => {
        try {
            const { months = 3 } = req.query;
            const result = await companyManagerService.getTopRevenueServices(parseInt(months));
            
            if (result.success) {
                res.json(result);
            } else {
                res.status(500).json(result);
            }
        } catch (error) {
            console.error('Error in getTopRevenueServices controller:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // GET /api/company-manager/employee-ratings
    getEmployeeRatings: async (req, res) => {
        try {
            const { branchId } = req.query;
            const result = await companyManagerService.getEmployeeRatings(branchId || null);
            
            if (result.success) {
                res.json(result);
            } else {
                res.status(500).json(result);
            }
        } catch (error) {
            console.error('Error in getEmployeeRatings controller:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // GET /api/company-manager/best-selling-products
    getBestSellingProducts: async (req, res) => {
        try {
            const { top = 10, branchId, fromDate, toDate } = req.query;
            const result = await companyManagerService.getBestSellingProducts(
                parseInt(top),
                branchId || null,
                fromDate || null,
                toDate || null
            );
            
            if (result.success) {
                res.json(result);
            } else {
                res.status(500).json(result);
            }
        } catch (error) {
            console.error('Error in getBestSellingProducts controller:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // GET /api/company-manager/branches
    getAllBranches: async (req, res) => {
        try {
            const result = await companyManagerService.getAllBranches();
            
            if (result.success) {
                res.json(result);
            } else {
                res.status(500).json(result);
            }
        } catch (error) {
            console.error('Error in getAllBranches controller:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // GET /api/company-manager/import-requests/pending
    getPendingImportRequests: async (req, res) => {
        try {
            const result = await companyManagerService.getPendingImportRequests();
            
            if (result.success) {
                res.json(result);
            } else {
                res.status(500).json(result);
            }
        } catch (error) {
            console.error('Error in getPendingImportRequests controller:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // GET /api/company-manager/import-requests/:requestId/details
    getImportRequestDetails: async (req, res) => {
        try {
            const { requestId } = req.params;
            const result = await companyManagerService.getImportRequestDetails(requestId);
            
            if (result.success) {
                res.json(result);
            } else {
                res.status(500).json(result);
            }
        } catch (error) {
            console.error('Error in getImportRequestDetails controller:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // POST /api/company-manager/import-requests/:requestId/approve
    approveImportRequest: async (req, res) => {
        try {
            const { requestId } = req.params;
            const { status } = req.body;
            
            if (!status) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Trạng thái là bắt buộc' 
                });
            }
            
            const result = await companyManagerService.approveImportRequest(requestId, status);
            
            if (result.success) {
                res.json(result);
            } else {
                res.status(500).json(result);
            }
        } catch (error) {
            console.error('Error in approveImportRequest controller:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // POST /api/company-manager/import-requests/:requestId/complete
    completeImportRequest: async (req, res) => {
        try {
            const { requestId } = req.params;
            
            const result = await companyManagerService.completeImportRequest(requestId);
            
            if (result.success) {
                res.json(result);
            } else {
                res.status(500).json(result);
            }
        } catch (error) {
            console.error('Error in completeImportRequest controller:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // GET /api/company-manager/employees
    getAllEmployees: async (req, res) => {
        try {
            const result = await companyManagerService.getAllEmployees();
            
            if (result.success) {
                res.json(result);
            } else {
                res.status(500).json(result);
            }
        } catch (error) {
            console.error('Error in getAllEmployees controller:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // POST /api/company-manager/employees/:employeeId/transfer
    transferEmployee: async (req, res) => {
        try {
            const { employeeId } = req.params;
            const { newBranchId, reason } = req.body;
            
            if (!newBranchId) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Chi nhánh mới là bắt buộc' 
                });
            }
            
            const result = await companyManagerService.transferEmployee(employeeId, newBranchId, reason);
            
            if (result.success) {
                res.json(result);
            } else {
                res.status(500).json(result);
            }
        } catch (error) {
            console.error('Error in transferEmployee controller:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

export default companyManagerController;
