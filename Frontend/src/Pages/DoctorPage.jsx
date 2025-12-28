import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AppointmentTable from '../Component/Doctor/AppointmentTable';
import MedicalRecordModal from '../Component/Doctor/MedicalRecordModal';
import PrescriptionModal from '../Component/Doctor/PrescriptionModal';
import NewAppointmentModal from '../Component/Doctor/NewAppointmentModal';
import ResultsModal from '../Component/Doctor/ResultsModal';

const DoctorPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
    
    // Medical Record State
    const [showMedicalRecordModal, setShowMedicalRecordModal] = useState(false);
    const [existingMedicalRecord, setExistingMedicalRecord] = useState(null);
    const [isEditingMedicalRecord, setIsEditingMedicalRecord] = useState(false);
    const [medicalRecordForm, setMedicalRecordForm] = useState({
        symptoms: '',
        diagnosis: '',
        weight: '',
        reExamDate: ''
    });
    
    // Prescription State
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
    const [medications, setMedications] = useState([]);
    const [selectedMedications, setSelectedMedications] = useState([]);
    const [medicalRecordId, setMedicalRecordId] = useState(null);
    const [existingPrescription, setExistingPrescription] = useState(null);
    const [isEditingPrescription, setIsEditingPrescription] = useState(false);
    
    // Results Modal State
    const [showResultsModal, setShowResultsModal] = useState(false);
    const [selectedAppointmentForResults, setSelectedAppointmentForResults] = useState(null);
    
    // New Appointment State
    const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
    const [customerSearch, setCustomerSearch] = useState('');
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerPets, setCustomerPets] = useState([]);
    const [availableServices, setAvailableServices] = useState([]);
    const [appointmentForm, setAppointmentForm] = useState({
        petId: '',
        dateTime: '',
        services: []
    });

    useEffect(() => {
        if (user?.MaNhanVien) {
            fetchAppointments();
        }
    }, [user, pagination.page]);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `http://localhost:5000/api/vet/appointments/${user.MaNhanVien}?page=${pagination.page}&limit=${pagination.limit}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                setAppointments(response.data.appointments);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.pagination.total,
                    totalPages: response.data.pagination.totalPages
                }));
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
            alert('Lỗi khi tải lịch hẹn');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Medical Record Functions
    const openMedicalRecordModal = async (appointment) => {
        setSelectedAppointment(appointment);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `http://localhost:5000/api/vet/medical-record/${appointment.MaLichHen}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (response.data.success && response.data.record) {
                // Existing record found - show in view mode
                setExistingMedicalRecord(response.data.record);
                setIsEditingMedicalRecord(false);
                setMedicalRecordForm({
                    symptoms: response.data.record.TrieuChung,
                    diagnosis: response.data.record.ChuanDoan,
                    weight: response.data.record.CanNang.toString(),
                    reExamDate: response.data.record.NgayTaiKham ? new Date(response.data.record.NgayTaiKham).toISOString().split('T')[0] : ''
                });
            } else {
                // No existing record - show create mode
                setExistingMedicalRecord(null);
                setIsEditingMedicalRecord(true);
                setMedicalRecordForm({ symptoms: '', diagnosis: '', weight: '', reExamDate: '' });
            }
            setShowMedicalRecordModal(true);
        } catch (error) {
            console.error('Error fetching medical record:', error);
            // If error, assume no record exists
            setExistingMedicalRecord(null);
            setIsEditingMedicalRecord(true);
            setMedicalRecordForm({ symptoms: '', diagnosis: '', weight: '', reExamDate: '' });
            setShowMedicalRecordModal(true);
        }
    };

    const saveMedicalRecord = async () => {
        try {
            const token = localStorage.getItem('token');
            
            if (existingMedicalRecord) {
                // Update existing record
                const response = await axios.put(
                    `http://localhost:5000/api/vet/medical-record/${existingMedicalRecord.MaHoSo}`,
                    {
                        symptoms: medicalRecordForm.symptoms,
                        diagnosis: medicalRecordForm.diagnosis,
                        weight: parseFloat(medicalRecordForm.weight),
                        reExamDate: medicalRecordForm.reExamDate || null
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (response.data.success) {
                    alert('Cập nhật hồ sơ khám thành công!');
                    setShowMedicalRecordModal(false);
                    setExistingMedicalRecord(null);
                    setIsEditingMedicalRecord(false);
                    setMedicalRecordForm({ symptoms: '', diagnosis: '', weight: '', reExamDate: '' });
                    fetchAppointments();
                }
            } else {
                // Create new record
                const response = await axios.post(
                    'http://localhost:5000/api/vet/medical-record/create',
                    {
                        appointmentId: selectedAppointment.MaLichHen,
                        symptoms: medicalRecordForm.symptoms,
                        diagnosis: medicalRecordForm.diagnosis,
                        weight: parseFloat(medicalRecordForm.weight),
                        reExamDate: medicalRecordForm.reExamDate || null
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (response.data.success) {
                    alert('Tạo hồ sơ khám thành công!');
                    setShowMedicalRecordModal(false);
                    setMedicalRecordForm({ symptoms: '', diagnosis: '', weight: '', reExamDate: '' });
                    fetchAppointments();
                }
            }
        } catch (error) {
            console.error('Error saving medical record:', error);
            alert('Lỗi khi lưu hồ sơ khám: ' + (error.response?.data?.message || error.message));
        }
    };

    // Prescription Functions
    const openPrescriptionModal = async (appointment) => {
        setSelectedAppointment(appointment);
        try {
            const token = localStorage.getItem('token');
            const recordResponse = await axios.get(
                `http://localhost:5000/api/vet/medical-record/${appointment.MaLichHen}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (recordResponse.data.success && recordResponse.data.record) {
                setMedicalRecordId(recordResponse.data.record.MaHoSo);
                
                const prescriptionResponse = await axios.get(
                    `http://localhost:5000/api/vet/prescription/${recordResponse.data.record.MaHoSo}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                const medsResponse = await axios.get(
                    'http://localhost:5000/api/vet/medications',
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                if (medsResponse.data.success) {
                    setMedications(medsResponse.data.medications);
                    
                    if (prescriptionResponse.data.success && prescriptionResponse.data.prescription.length > 0) {
                        setExistingPrescription(prescriptionResponse.data.prescription);
                        setIsEditingPrescription(false);
                        setSelectedMedications(prescriptionResponse.data.prescription.map(item => ({
                            productId: item.MaSanPham,
                            quantity: item.SoLuong,
                            usage: item.CachDung
                        })));
                    } else {
                        setExistingPrescription(null);
                        setIsEditingPrescription(true);
                        setSelectedMedications([]);
                    }
                    
                    setShowPrescriptionModal(true);
                }
            } else {
                alert('Vui lòng tạo hồ sơ khám trước khi kê toa thuốc');
            }
        } catch (error) {
            console.error('Error opening prescription modal:', error);
            alert('Lỗi khi mở toa thuốc');
        }
    };

    const addMedicationToPrescription = () => {
        setSelectedMedications([...selectedMedications, { productId: '', quantity: 1, usage: '' }]);
    };

    const updateMedication = (index, field, value) => {
        const updated = [...selectedMedications];
        updated[index][field] = value;
        setSelectedMedications(updated);
    };

    const removeMedication = (index) => {
        setSelectedMedications(selectedMedications.filter((_, i) => i !== index));
    };

    const savePrescription = async () => {
        if (selectedMedications.length === 0) {
            alert('Vui lòng thêm ít nhất một loại thuốc');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            
            if (existingPrescription) {
                await axios.delete(
                    `http://localhost:5000/api/vet/prescription/${medicalRecordId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            
            const response = await axios.post(
                'http://localhost:5000/api/vet/prescription/create',
                {
                    medicalRecordId,
                    medications: selectedMedications
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                alert(existingPrescription ? 'Cập nhật toa thuốc thành công!' : 'Tạo toa thuốc thành công!');
                setShowPrescriptionModal(false);
                setSelectedMedications([]);
                setMedicalRecordId(null);
                setExistingPrescription(null);
                setIsEditingPrescription(false);
            }
        } catch (error) {
            console.error('Error saving prescription:', error);
            alert('Lỗi khi lưu toa thuốc: ' + (error.response?.data?.message || error.message));
        }
    };

    // New Appointment Functions
    const searchCustomers = async (query) => {
        if (query.length < 2) return;
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `http://localhost:5000/api/vet/customers/search?query=${query}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                setCustomers(response.data.customers);
            }
        } catch (error) {
            console.error('Error searching customers:', error);
        }
    };

    const selectCustomer = async (customer) => {
        setSelectedCustomer(customer);
        setCustomers([]);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `http://localhost:5000/api/vet/customer/${customer.MaKhachHang}/pets`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                setCustomerPets(response.data.pets);
            }
        } catch (error) {
            console.error('Error fetching customer pets:', error);
        }
    };

    const openNewAppointmentModal = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `http://localhost:5000/api/vet/services/${user.MaChiNhanh}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                setAvailableServices(response.data.services);
                setShowNewAppointmentModal(true);
            }
        } catch (error) {
            console.error('Error fetching services:', error);
            alert('Lỗi khi tải danh sách dịch vụ');
        }
    };

    const toggleService = (service) => {
        const exists = appointmentForm.services.find(s => s.serviceId === service.MaDichVu);
        if (exists) {
            setAppointmentForm({
                ...appointmentForm,
                services: appointmentForm.services.filter(s => s.serviceId !== service.MaDichVu)
            });
        } else {
            setAppointmentForm({
                ...appointmentForm,
                services: [...appointmentForm.services, { serviceId: service.MaDichVu, price: service.GiaNiemYet }]
            });
        }
    };

    const createNewAppointment = async () => {
        if (!selectedCustomer || !appointmentForm.petId || !appointmentForm.dateTime || appointmentForm.services.length === 0) {
            alert('Vui lòng điền đầy đủ thông tin lịch hẹn');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:5000/api/vet/appointment/create',
                {
                    customerId: selectedCustomer.MaKhachHang,
                    petId: appointmentForm.petId,
                    branchId: user.MaChiNhanh,
                    vetId: user.MaNhanVien,
                    services: appointmentForm.services,
                    dateTime: appointmentForm.dateTime
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                alert('Tạo lịch hẹn mới thành công!');
                setShowNewAppointmentModal(false);
                setSelectedCustomer(null);
                setCustomerPets([]);
                setAppointmentForm({ petId: '', dateTime: '', services: [] });
                fetchAppointments();
            }
        } catch (error) {
            console.error('Error creating appointment:', error);
            alert('Lỗi khi tạo lịch hẹn: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleCustomerSearchChange = (value) => {
        setCustomerSearch(value);
        searchCustomers(value);
    };

    const handleCloseNewAppointmentModal = () => {
        setShowNewAppointmentModal(false);
        setSelectedCustomer(null);
        setCustomerPets([]);
        setAppointmentForm({ petId: '', dateTime: '', services: [] });
        setCustomerSearch('');
        setCustomers([]);
    };

    const handleClosePrescriptionModal = () => {
        setShowPrescriptionModal(false);
        setExistingPrescription(null);
        setIsEditingPrescription(false);
        setSelectedMedications([]);
    };

    // Styles
    const containerStyle = {
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '20px'
    };

    const headerStyle = {
        backgroundColor: '#3498db',
        color: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    };

    const buttonStyle = {
        padding: '10px 20px',
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px'
    };

    const primaryButtonStyle = {
        padding: '10px 20px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        marginRight: '10px'
    };

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <div>
                    <h1 style={{ margin: '0 0 10px 0' }}>👨‍⚕️ Trang Bác Sĩ</h1>
                    <p style={{ margin: 0 }}>Xin chào, Bác sĩ {user?.HoTen}</p>
                </div>
                <div>
                    <button onClick={openNewAppointmentModal} style={primaryButtonStyle}>
                        ➕ Tạo lịch hẹn mới
                    </button>
                    <button onClick={handleLogout} style={buttonStyle}>
                        Đăng xuất
                    </button>
                </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px' }}>
                <h2>📅 Lịch hẹn của tôi</h2>
                
                {loading ? (
                    <p>Đang tải...</p>
                ) : appointments.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#666' }}>Không có lịch hẹn nào</p>
                ) : (
                    <>
                        <AppointmentTable 
                            appointments={appointments}
                            onCreateMedicalRecord={openMedicalRecordModal}
                            onCreatePrescription={openPrescriptionModal}
                            onEditResults={(appt) => {
                                setSelectedAppointmentForResults(appt.MaLichHen);
                                setShowResultsModal(true);
                            }}
                        />
                        
                        {/* Pagination Controls */}
                        {pagination.totalPages > 1 && (
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'center', 
                                alignItems: 'center', 
                                gap: '10px',
                                marginTop: '20px',
                                padding: '10px'
                            }}>
                                <button 
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                    disabled={pagination.page === 1}
                                    style={{
                                        padding: '8px 16px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        backgroundColor: pagination.page === 1 ? '#f5f5f5' : '#fff',
                                        cursor: pagination.page === 1 ? 'not-allowed' : 'pointer',
                                        color: pagination.page === 1 ? '#999' : '#333'
                                    }}
                                >
                                    ← Trước
                                </button>
                                
                                <span style={{ color: '#666', fontSize: '14px' }}>
                                    Trang {pagination.page} / {pagination.totalPages} 
                                    <span style={{ marginLeft: '10px', color: '#999' }}>
                                        ({pagination.total} lịch hẹn)
                                    </span>
                                </span>
                                
                                <button 
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                    disabled={pagination.page === pagination.totalPages}
                                    style={{
                                        padding: '8px 16px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        backgroundColor: pagination.page === pagination.totalPages ? '#f5f5f5' : '#fff',
                                        cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer',
                                        color: pagination.page === pagination.totalPages ? '#999' : '#333'
                                    }}
                                >
                                    Sau →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <MedicalRecordModal 
                show={showMedicalRecordModal}
                onClose={() => {
                    setShowMedicalRecordModal(false);
                    setExistingMedicalRecord(null);
                    setIsEditingMedicalRecord(false);
                }}
                selectedAppointment={selectedAppointment}
                existingRecord={existingMedicalRecord}
                isEditingRecord={isEditingMedicalRecord}
                setIsEditingRecord={setIsEditingMedicalRecord}
                formData={medicalRecordForm}
                onChange={setMedicalRecordForm}
                onSave={saveMedicalRecord}
            />

            <PrescriptionModal 
                show={showPrescriptionModal}
                onClose={handleClosePrescriptionModal}
                selectedAppointment={selectedAppointment}
                existingPrescription={existingPrescription}
                isEditingPrescription={isEditingPrescription}
                setIsEditingPrescription={setIsEditingPrescription}
                medications={medications}
                selectedMedications={selectedMedications}
                onAddMedication={addMedicationToPrescription}
                onUpdateMedication={updateMedication}
                onRemoveMedication={removeMedication}
                onSave={savePrescription}
            />

            <NewAppointmentModal 
                show={showNewAppointmentModal}
                onClose={handleCloseNewAppointmentModal}
                customerSearch={customerSearch}
                onCustomerSearchChange={handleCustomerSearchChange}
                customers={customers}
                onSelectCustomer={selectCustomer}
                selectedCustomer={selectedCustomer}
                customerPets={customerPets}
                availableServices={availableServices}
                appointmentForm={appointmentForm}
                onAppointmentFormChange={setAppointmentForm}
                onToggleService={toggleService}
                onSave={createNewAppointment}
            />

            <ResultsModal 
                show={showResultsModal}
                onClose={() => {
                    setShowResultsModal(false);
                    setSelectedAppointmentForResults(null);
                }}
                appointmentId={selectedAppointmentForResults}
                onSuccess={fetchAppointments}
            />
        </div>
    );
};

export default DoctorPage;
