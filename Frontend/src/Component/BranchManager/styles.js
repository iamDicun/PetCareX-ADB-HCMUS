export const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px'
};

export const headerStyle = {
    backgroundColor: '#16a085',
    color: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
};

export const tabsStyle = {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap'
};

export const tabButtonStyle = (isActive) => ({
    padding: '12px 24px',
    backgroundColor: isActive ? '#16a085' : 'white',
    color: isActive ? 'white' : '#333',
    border: '2px solid #16a085',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s'
});

export const contentStyle = {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
};

export const dateFilterStyle = {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px',
    alignItems: 'center',
    flexWrap: 'wrap'
};

export const inputStyle = {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
};

export const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: '#16a085',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
};

export const logoutButtonStyle = {
    padding: '10px 20px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px'
};

export const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px'
};

export const thStyle = {
    backgroundColor: '#16a085',
    color: 'white',
    padding: '12px',
    textAlign: 'left',
    fontWeight: '600'
};

export const tdStyle = {
    padding: '12px',
    borderBottom: '1px solid #ddd'
};

export const cardStyle = {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #dee2e6'
};
