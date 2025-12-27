import CusService from '../Services/customer.service.js';
import jwt from 'jsonwebtoken';

const cusController = {
    Login : async (req, res) => {
        const { hoten, sdt } = req.body;

        try {
            if (!sdt || !hoten) {
                return res.status(400).json({ success: false, message: 'Tên và Số điện thoại là bắt buộc' });
            }

            const customer = await CusService.findByPhoneNum(sdt);
            
            if (customer) {
                // Check if name matches (case insensitive)
                if (customer.HoTen.toLowerCase() === hoten.toLowerCase()) {
                    const token = jwt.sign(
                        { id: customer.MaKhachHang, role: 'customer', name: customer.HoTen },
                        process.env.JWT_SECRET,
                        { expiresIn: '24h' }
                    );
                    console.log('Customer logged in:', customer.HoTen);
                    res.json({ success: true, customer: customer, token: token });
                } else {
                    res.json({ success: false, message: 'Tên khách hàng không khớp' });
                }
            } else {
                res.json({ success: false, message: 'Sai thông tin đăng nhập' });
            }
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: 'Lỗi máy chủ', 
                error: error.message 
            });
        }
    },

    getProducts: async (req, res) => {
        try {
            const products = await CusService.getProducts();
            res.json({ success: true, data: products });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getServices: async (req, res) => {
        try {
            const services = await CusService.getServices();
            res.json({ success: true, data: services });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    search: async (req, res) => {
        try {
            const { keyword } = req.query;
            const results = await CusService.search(keyword);
            res.json({ success: true, data: results });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    registerPet: async (req, res) => {
        try {
            const result = await CusService.registerPet(req.body);
            res.json({ success: true, message: 'Đăng ký thú cưng thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getPetTypes: async (req, res) => {
        try {
            const types = await CusService.getPetTypes();
            res.json({ success: true, data: types });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    createOrder: async (req, res) => {
        try {
            const result = await CusService.createOrder(req.body);
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    createAppointment: async (req, res) => {
        try {
            const result = await CusService.createAppointment(req.body);
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getHistory: async (req, res) => {
        try {
            const { id } = req.params;
            const history = await CusService.getHistory(id);
            res.json({ success: true, data: history });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getBranches: async (req, res) => {
        try {
            const branches = await CusService.getBranches();
            res.json({ success: true, data: branches });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getAvailableVets: async (req, res) => {
        try {
            const { branchId } = req.params;
            const { appointmentTime } = req.query;
            const vets = await CusService.getAvailableVets(branchId, appointmentTime);
            res.json({ success: true, data: vets });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getCustomerPets: async (req, res) => {
        try {
            const { id } = req.params;
            const pets = await CusService.getCustomerPets(id);
            res.json({ success: true, data: pets });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getSuitableProducts: async (req, res) => {
        try {
            const { petId } = req.params;
            const products = await CusService.getSuitableProducts(petId);
            res.json({ success: true, data: products });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getConfirmedInvoices: async (req, res) => {
        try {
            const { id } = req.params;
            const invoices = await CusService.getConfirmedInvoices(id);
            res.json({ 
                success: true, 
                data: invoices,
                message: `Tìm thấy ${invoices.length} hóa đơn` 
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getUpcomingVaccinations: async (req, res) => {
        try {
            const { id } = req.params;
            const vaccinations = await CusService.getUpcomingVaccinations(id);
            res.json({ 
                success: true, 
                data: vaccinations,
                message: `Tìm thấy ${vaccinations.length} lịch tiêm chủng sắp tới` 
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getAppointmentDetails: async (req, res) => {
        try {
            const { appointmentId } = req.params;
            const details = await CusService.getAppointmentDetails(appointmentId);
            res.json({ success: true, data: details });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getOrderDetails: async (req, res) => {
        try {
            const { orderId } = req.params;
            const details = await CusService.getOrderDetails(orderId);
            res.json({ success: true, data: details });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    submitRating: async (req, res) => {
        try {
            const { maHoaDon, diemChatLuong, diemThaiDo, binhLuan } = req.body;
            
            if (!maHoaDon || !diemChatLuong || !diemThaiDo) {
                return res.status(400).json({ success: false, message: 'Thiếu thông tin đánh giá' });
            }
            
            if (diemChatLuong < 1 || diemChatLuong > 5 || diemThaiDo < 1 || diemThaiDo > 5) {
                return res.status(400).json({ success: false, message: 'Điểm đánh giá phải từ 1-5' });
            }
            
            await CusService.submitRating({ maHoaDon, diemChatLuong, diemThaiDo, binhLuan });
            res.json({ success: true, message: 'Đánh giá thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getPetMedicalHistory: async (req, res) => {
        try {
            const { petId } = req.params;
            const history = await CusService.getPetMedicalHistory(petId);
            res.json({ success: true, data: history });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

};

export default cusController;