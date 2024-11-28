import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import {
    getAllPropertiesValues,
    createPropertyValue,
    updatePropertyValue,
    deletePropertyValue,
} from '../api/propertiesValueApi';
import { getAllProperties } from '../api/propertyApi';
import './PropertiesValues.css';

const PropertyValueManager = () => {
    const [propertiesValues, setPropertiesValues] = useState([]);
    const [properties, setProperties] = useState([]);
    const [propertyValue, setPropertyValue] = useState({
        id: '',
        name: '',
        description: '',
        propertyId: '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState('');

    const fetchProperties = async () => {
        try {
            const data = await getAllProperties();
            setProperties(data);
        } catch (err) {
            setError('Lỗi khi lấy danh mục: ' + err.message);
        }
    };

    const fetchPropertiesValues = async () => {
        try {
            const data = await getAllPropertiesValues();
            setPropertiesValues(data);
        } catch (err) {
            setError('Lỗi khi lấy dữ liệu: ' + err.message);
        }
    };

    useEffect(() => {
        fetchProperties();
        fetchPropertiesValues();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPropertyValue({ ...propertyValue, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const propertyValueData = { ...propertyValue };

        if (!isEditing) {
            delete propertyValueData.id;
        }

        try {
            if (isEditing) {
                await updatePropertyValue(propertyValue.id, propertyValueData);
                Swal.fire('Thành công!', 'Cập nhật thành công', 'success');
            } else {
                await createPropertyValue(propertyValueData);
                Swal.fire('Thành công!', 'Tạo mới thành công', 'success');
            }
            setPropertyValue({ id: '', name: '', description: '', propertyId: '' });
            setIsEditing(false);
            setIsModalOpen(false);
            setError('');
            fetchPropertiesValues();
        } catch (err) {
            setError('Lỗi khi thao tác: ' + err.message);
        }
    };

    const handleEdit = (propValue) => {
        setPropertyValue(propValue);
        setIsEditing(true);
        setIsModalOpen(true);
        setError('');
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Xác nhận xóa?',
            text: 'Bạn có chắc chắn muốn xóa mục này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            try {
                await deletePropertyValue(id);
                Swal.fire('Đã xóa!', 'Xóa thành công', 'success');
                fetchPropertiesValues();
            } catch (err) {
                setError('Lỗi khi xóa: ' + err.message);
            }
        }
    };

    return (
        <div className="pv-container mt-5">
            <h2 className="pv-title">Quản lý thuộc tính</h2>

            {error && <div className="pv-alert-error">{error}</div>}

            <div className="d-flex justify-content-end mb-3">
                <button
                    className="pv-btn-primary"
                    onClick={() => {
                        setPropertyValue({ id: '', name: '', description: '', propertyId: '' });
                        setIsEditing(false);
                        setIsModalOpen(true);
                    }}
                >
                    Thêm mới
                </button>
            </div>

            <table className="pv-table">
                <thead>
                    <tr>
                        <th>Tên</th>
                        <th>Mô tả</th>
                        <th>Danh mục</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {propertiesValues.length > 0 ? (
                        propertiesValues.map((propValue) => (
                            <tr key={propValue.id}>
                                <td>{propValue.name}</td>
                                <td>{propValue.description}</td>
                                <td>{propValue.properties?.name}</td>
                                <td>
                                    <button
                                        className="pv-btn-action pv-btn-edit me-1"
                                        onClick={() => handleEdit(propValue)}
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        className="pv-btn-action pv-btn-delete"
                                        onClick={() => handleDelete(propValue.id)}
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="text-center">
                                Không có dữ liệu
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <form onSubmit={handleSubmit}>
                            <h4 className="text-center">{isEditing ? 'Cập nhật' : 'Thêm mới'}</h4>
                            <div className="form-group mt-3">
                                <label htmlFor="name">Tên</label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    className="pv-form-control"
                                    placeholder="Nhập tên"
                                    value={propertyValue.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group mt-3">
                                <label htmlFor="description">Mô tả</label>
                                <textarea
                                    name="description"
                                    id="description"
                                    className="pv-form-control"
                                    placeholder="Nhập mô tả"
                                    value={propertyValue.description}
                                    onChange={handleChange}
                                    required
                                ></textarea>
                            </div>
                            <div className="form-group mt-3">
                                <label htmlFor="propertyId">Danh mục</label>
                                <select
                                    name="propertyId"
                                    id="propertyId"
                                    className="pv-form-control"
                                    value={propertyValue.propertyId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Chọn danh mục</option>
                                    {properties.map((prop) => (
                                        <option key={prop.id} value={prop.id}>
                                            {prop.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="d-flex justify-content-end mt-4">
                                <button type="submit" className="pv-btn-primary">
                                    {isEditing ? 'Cập nhật' : 'Thêm mới'}
                                </button>
                                <button
                                    type="button"
                                    className="pv-btn-secondary ml-2"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PropertyValueManager;
