import CusService from '../Services/customer.service.js';

const cusController = {
    Login : async (req, res) => {
        const { hoten, sdt } = req.body;

        try {
            if (!sdt) {
                return res.status(400).json({ success: false, message: 'Số điện thoại là bắt buộc' });
            }

            const customer = await CusService.findByPhoneNum(sdt);
            
            if (customer) {
                res.json({ success: true, customer: customer });
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
    }

};

export default cusController;