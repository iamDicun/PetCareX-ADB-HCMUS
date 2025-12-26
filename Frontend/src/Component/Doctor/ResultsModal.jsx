import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ResultsModal = ({ show, onClose, appointmentId, onSuccess }) => {
  const [serviceResults, setServiceResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (show && appointmentId) {
      fetchServiceResults();
    }
  }, [show, appointmentId]);

  const fetchServiceResults = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/vet/appointment/${appointmentId}/results`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setServiceResults(response.data.results || []);
    } catch (error) {
      console.error('Error fetching service results:', error);
      alert('Không thể tải kết quả dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const handleResultChange = (serviceId, value) => {
    setServiceResults(prev =>
      prev.map(sr =>
        sr.MaDichVu === serviceId ? { ...sr, KetQua: value } : sr
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      // Update each service result
      for (const result of serviceResults) {
        await axios.put(
          `http://localhost:5000/api/vet/appointment/${appointmentId}/service/${result.MaDichVu}/result`,
          { ketQua: result.KetQua || '' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      alert('Cập nhật kết quả thành công!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating service results:', error);
      alert('Lỗi khi cập nhật kết quả');
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Cập nhật Kết quả Dịch vụ</h2>
          <button onClick={onClose} style={styles.closeBtn}>×</button>
        </div>

        <div style={styles.body}>
          {loading ? (
            <p style={styles.loadingText}>Đang tải...</p>
          ) : (
            <>
              {serviceResults.length === 0 ? (
                <p style={styles.noData}>Không có dịch vụ nào</p>
              ) : (
                <div style={styles.serviceList}>
                  {serviceResults.map((result) => (
                    <div key={result.MaDichVu} style={styles.serviceItem}>
                      <label style={styles.label}>{result.TenDichVu}</label>
                      <textarea
                        value={result.KetQua || ''}
                        onChange={(e) => handleResultChange(result.MaDichVu, e.target.value)}
                        placeholder="Nhập kết quả..."
                        style={styles.textarea}
                        rows={3}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div style={styles.footer}>
          <button onClick={onClose} style={styles.cancelBtn} disabled={saving}>
            Hủy
          </button>
          <button 
            onClick={handleSave} 
            style={styles.saveBtn} 
            disabled={loading || saving || serviceResults.length === 0}
          >
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
  },
  header: {
    padding: '20px',
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
    color: '#2c3e50'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '28px',
    cursor: 'pointer',
    color: '#7f8c8d',
    padding: '0',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  body: {
    padding: '20px',
    overflowY: 'auto',
    flex: 1
  },
  loadingText: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontSize: '14px'
  },
  noData: {
    textAlign: 'center',
    color: '#95a5a6',
    fontSize: '14px'
  },
  serviceList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  serviceItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontWeight: '600',
    color: '#2c3e50',
    fontSize: '14px'
  },
  textarea: {
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: '60px'
  },
  footer: {
    padding: '15px 20px',
    borderTop: '1px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px'
  },
  cancelBtn: {
    padding: '10px 20px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    backgroundColor: 'white',
    color: '#7f8c8d',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  saveBtn: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#3498db',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  }
};

export default ResultsModal;
