import staffService from "../Services/staff.service.js";
import jwt from 'jsonwebtoken';

const staffController = {
    async login(req, res) {
        const { hoten, sdt } = req.body;
        try {
            if (!sdt || !hoten) {
                return res.status(400).json({ success: false, message: 'Tên và Số điện thoại là bắt buộc' });
            }
            const staff = await staffService.findByPhoneNum(sdt);
            if (staff) {
                // Check if name matches (case insensitive)
                if (staff.HoTen.toLowerCase() === hoten.toLowerCase()) {
                    const token = jwt.sign(
                        { 
                            id: staff.MaNhanVien, 
                            MaNhanVien: staff.MaNhanVien,
                            role: 'staff', 
                            name: staff.HoTen 
                        },
                        process.env.JWT_SECRET,
                        { expiresIn: '24h' }
                    );
                    console.log('Staff logged in:', staff.HoTen);
                    res.json({ success: true, staff: staff, token: token });
                } else {
                    res.json({ success: false, message: 'Tên nhân viên không khớp' });
                }
            } else {
                res.json({ success: false, message: 'Sai thông tin đăng nhập' });
            }
        } catch (error) {
            console.error('[login] Error:', error.message, error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    },

    async getProducts(req, res) {
        try {
            const products = await staffService.getProducts();
            res.json({ success: true, products });
        } catch (error) {
            console.error('[getProducts] Error:', error.message, error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    },

    async getPetTypes(req, res) {
        try {
            const petTypes = await staffService.getPetTypes();
            res.json({ success: true, petTypes });
        } catch (error) {
            console.error('[getPetTypes] Error:', error.message, error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    },

    async registerPet(req, res) {
        try {
            // Check if user is a doctor - doctors cannot register pets
            const staffId = req.user?.id || req.user?.MaNhanVien;
            if (staffId) {
                const staffInfo = await staffService.findByPhoneNum(req.body.staffPhone || '');
                if (staffInfo && staffInfo.ChucVu === 'Bác sĩ thú y') {
                    return res.status(403).json({ 
                        success: false, 
                        message: 'Bác sĩ không có quyền đăng ký thú cưng cho khách hàng' 
                    });
                }
            }
            
            const { maKhachHang, maLoaiTC, tenThuCung, giong, ngaySinh, gioiTinh, canNang, tinhTrangSK } = req.body;
            
            if (!maKhachHang || !maLoaiTC || !tenThuCung || !gioiTinh) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Vui lòng cung cấp đầy đủ thông tin bắt buộc' 
                });
            }

            const petData = {
                MaKhachHang: maKhachHang,
                MaLoaiTC: maLoaiTC,
                TenThuCung: tenThuCung,
                Giong: giong,
                NgaySinh: ngaySinh,
                GioiTinh: gioiTinh,
                CanNang: canNang,
                TinhTrangSK: tinhTrangSK
            };

            await staffService.registerPetForCustomer(petData);
            res.json({ success: true, message: 'Đăng ký thú cưng thành công' });
        } catch (error) {
            console.error('[registerPet] Error:', error.message, error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    },

    async getServices(req, res) {
        try {
            const services = await staffService.getServices();
            res.json({ success: true, services });
        } catch (error) {
            console.error('[getServices] Error:', error.message, error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    },

    async findOrCreateCustomer(req, res) {
        const { name, phoneNum } = req.body;
        try {
            if (!name || !phoneNum) {
                return res.status(400).json({ success: false, message: 'Tên và số điện thoại là bắt buộc' });
            }
            const customer = await staffService.findOrCreateCustomer(name, phoneNum);
            res.json({ success: true, customer });
        } catch (error) {
            console.error('[findOrCreateCustomer] Error:', error.message, error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    },

    async getAvailableDoctors(req, res) {
        const { branchId, dateTime } = req.query;
        try {
            if (!branchId || !dateTime) {
                return res.status(400).json({ success: false, message: 'Chi nhánh và thời gian là bắt buộc' });
            }
            const doctors = await staffService.getAvailableDoctors(branchId, dateTime);
            res.json({ success: true, doctors });
        } catch (error) {
            console.error('[getAvailableDoctors] Error:', error.message, error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    },

    async getAvailableCareStaff(req, res) {
        const { branchId, dateTime } = req.query;
        try {
            if (!branchId || !dateTime) {
                return res.status(400).json({ success: false, message: 'Chi nhánh và thời gian là bắt buộc' });
            }
            const careStaff = await staffService.getAvailableCareStaff(branchId, dateTime);
            res.json({ success: true, careStaff });
        } catch (error) {
            console.error('[getAvailableCareStaff] Error:', error.message, error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    },

    async createOrder(req, res) {
        try {
            const orderData = req.body;
            if (!orderData.maKhachHang || !orderData.maChiNhanh || !orderData.maNhanVien || !orderData.items || orderData.items.length === 0) {
                return res.status(400).json({ success: false, message: 'Thiếu thông tin đơn hàng' });
            }
            const result = await staffService.createOrder(orderData);
            res.json({ success: true, ...result });
        } catch (error) {
            console.error('[createOrder] Error:', error.message, error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ: ' + error.message });
        }
    },

    async createAppointment(req, res) {
        try {
            const appointmentData = req.body;
            if (!appointmentData.maKhachHang || !appointmentData.maChiNhanh || !appointmentData.maNhanVien || 
                !appointmentData.services || appointmentData.services.length === 0) {
                return res.status(400).json({ success: false, message: 'Thiếu thông tin lịch hẹn' });
            }
            // Validate each service has required fields
            for (const service of appointmentData.services) {
                if (!service.ngayGioHen || !service.maDichVu || !service.maBacSi) {
                    return res.status(400).json({ success: false, message: 'Mỗi dịch vụ phải có thời gian và nhân viên' });
                }
            }
            const result = await staffService.createAppointment(appointmentData);
            res.json({ success: true, ...result });
        } catch (error) {
            console.error('[createAppointment] Error:', error.message, error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ: ' + error.message });
        }
    },

    async getPendingOrders(req, res) {
        const { branchId } = req.query;
        try {
            if (!branchId) {
                return res.status(400).json({ success: false, message: 'Thiếu mã chi nhánh' });
            }
            const orders = await staffService.getPendingOrders(branchId);
            res.json({ success: true, orders });
        } catch (error) {
            console.error('[getPendingOrders] Error:', error.message, error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    },

    async getPendingAppointments(req, res) {
        const { branchId, page = 1, limit = 10 } = req.query;
        try {
            if (!branchId) {
                return res.status(400).json({ success: false, message: 'Thiếu mã chi nhánh' });
            }
            const result = await staffService.getPendingAppointments(branchId, parseInt(page), parseInt(limit));
            res.json({ success: true, ...result });
        } catch (error) {
            console.error('[getPendingAppointments] Error:', error.message, error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    },

    async getOrderDetails(req, res) {
        const { orderId } = req.params;
        try {
            if (!orderId) {
                return res.status(400).json({ success: false, message: 'Thiếu mã đơn hàng' });
            }
            const details = await staffService.getOrderDetails(orderId);
            res.json({ success: true, details });
        } catch (error) {
            console.error('[getOrderDetails] Error:', error.message, error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    },

    async getAppointmentDetails(req, res) {
        const { appointmentId } = req.params;
        try {
            if (!appointmentId) {
                return res.status(400).json({ success: false, message: 'Thiếu mã lịch hẹn' });
            }
            const details = await staffService.getAppointmentDetails(appointmentId);
            res.json({ success: true, details });
        } catch (error) {
            console.error('[getAppointmentDetails] Error:', error.message, error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    },

    async getCustomerPets(req, res) {
        const { customerId } = req.params;
        try {
            if (!customerId) {
                return res.status(400).json({ success: false, message: 'Thiếu mã khách hàng' });
            }
            const pets = await staffService.getCustomerPets(customerId);
            res.json({ success: true, pets });
        } catch (error) {
            console.error('[getCustomerPets] Error:', error.message, error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    },

    async confirmOrder(req, res) {
        const { orderId } = req.params;
        const { staffId } = req.body;
        try {
            if (!orderId) {
                return res.status(400).json({ success: false, message: 'Thiếu mã đơn hàng' });
            }
            const result = await staffService.confirmOrder(orderId, staffId);
            res.json({ success: true, message: 'Xác nhận đơn hàng thành công', ...result });
        } catch (error) {
            console.error('[confirmOrder] Error:', error.message, error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ: ' + error.message });
        }
    },

    async confirmAppointment(req, res) {
        const { appointmentId } = req.params;
        const { staffId } = req.body;
        try {
            if (!appointmentId) {
                return res.status(400).json({ success: false, message: 'Thiếu mã lịch hẹn' });
            }
            const result = await staffService.confirmAppointment(appointmentId, staffId);
            res.json({ success: true, message: 'Xác nhận lịch hẹn thành công', ...result });
        } catch (error) {
            console.error('[confirmAppointment] Error:', error.message, error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ: ' + error.message });
        }
    },

};

export default staffController;