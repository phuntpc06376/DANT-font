import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2'; // Import thư viện SweetAlert2
import {
    getAllProperties,
    createProperty,
    updateProperty,
    deleteProperty,
} from '../api/propertyApi';
import './Property.css';

const PropertyManager = () => {
    const [properties, setProperties] = useState([]);
    const [property, setProperty] = useState({
        id: '',
        name: '',
        description: '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); // Quản lý modal
    const [error, setError] = useState('');

    const fetchProperties = async () => {
        try {
            const data = await getAllProperties();
            setProperties(data);
        } catch (err) {
            setError('Lỗi khi lấy dữ liệu tài sản: ' + err.message);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProperty({ ...property, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const propertyData = { ...property };
        if (!isEditing) {
            delete propertyData.id;
        }

        try {
            if (isEditing) {
                await updateProperty(property.id, propertyData);
                Swal.fire('Thành công', 'Cập nhật thuộc tính con thành công!', 'success');
            } else {
                await createProperty(propertyData);
                Swal.fire('Thành công', 'Thêm thuộc tính con mới thành công!', 'success');
            }
            setProperty({ id: '', name: '', description: '' });
            setIsEditing(false);
            setIsModalOpen(false); // Ẩn modal sau khi thao tác thành công
            setError('');
            fetchProperties();
        } catch (err) {
            setError('Lỗi khi thao tác với thuộc tính con: ' + err.message);
            Swal.fire('Lỗi', 'Có lỗi xảy ra khi thao tác với thuộc tính con!', 'error');
        }
    };

    const handleEdit = (prop) => {
        setProperty(prop);
        setIsEditing(true);
        setIsModalOpen(true); // Hiển thị modal khi chỉnh sửa
        setError('');
    };

    const handleDelete = async (id) => {
        Swal.fire({
            title: 'Bạn có chắc chắn?',
            text: 'Bạn sẽ không thể hoàn tác thao tác này!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Xóa!',
            cancelButtonText: 'Hủy',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteProperty(id);
                    Swal.fire('Đã xóa!', 'Thuộc tính con đã được xóa.', 'success');
                    fetchProperties();
                } catch (err) {
                    setError('Lỗi khi xóa danh mục: ' + err.message);
                    Swal.fire('Lỗi', 'Có lỗi xảy ra khi xóa thuộc tính con!', 'error');
                }
            }
        });
    };

    return (
        <div className="property-manager-container">
    <h2 className="property-manager-title">Quản lý thuộc tính con</h2>

    {error && <div className="property-manager-alert-danger">{error}</div>}

    <div className="d-flex justify-content-end mb-3">
        <button
            className="property-manager-btn-primary"
            onClick={() => {
                setIsModalOpen(true);
                setIsEditing(false);
                setProperty({ id: '', name: '', description: '' });
            }}
        >
            Thêm thuộc tính con
        </button>
    </div>

    {/* Modal thêm/sửa */}
    {isModalOpen && (
        <div className="property-manager-modal-overlay">
            <div className="property-manager-modal-content">
                <form onSubmit={handleSubmit} className="pm-form">
                    <h4>{isEditing ? 'Cập nhật thuộc tính con' : 'Thêm thuộc tính con'}</h4>
                    <div className="property-manager-form-group">
                        <label htmlFor="name">Tên thuộc tính con</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            className="property-manager-form-control"
                            value={property.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="property-manager-form-group">
                        <label htmlFor="description">Mô tả</label>
                        <textarea
                            name="description"
                            id="description"
                            className="property-manager-form-control"
                            value={property.description}
                            onChange={handleChange}
                            required
                        ></textarea>
                    </div>
                    <div className="d-flex justify-content-end">
                        <button type="submit" className="property-manager-btn-primary">
                            {isEditing ? 'Cập nhật' : 'Thêm'}
                        </button>
                        <button
                            type="button"
                            className="property-manager-btn-secondary ml-2"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )}

    {/* Bảng tài sản */}
    <table className="property-manager-table">
        <thead>
            <tr>
                <th>Tên</th>
                <th>Mô tả</th>
                <th>Hành động</th>
            </tr>
        </thead>
        <tbody>
            {properties.length > 0 ? (
                properties.map((prop) => (
                    <tr key={prop.id}>
                        <td>{prop.name}</td>
                        <td>{prop.description}</td>
                        <td>
                            <button
                                className="property-manager-table-action-btn property-manager-table-btn-edit me-1"
                                onClick={() => handleEdit(prop)}
                            >
                                Sửa
                            </button>
                            <button
                                className="property-manager-table-action-btn property-manager-table-btn-delete"
                                onClick={() => handleDelete(prop.id)}
                            >
                                Xóa
                            </button>
                        </td>
                    </tr>
                ))
            ) : (
                <tr>
                    <td colSpan="3" className="text-center">
                        Không có dữ liệu
                    </td>
                </tr>
            )}
        </tbody>
    </table>
</div>

    );
};

export default PropertyManager;
