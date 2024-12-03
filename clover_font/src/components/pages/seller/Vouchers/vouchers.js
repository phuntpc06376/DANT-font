import React, { useEffect, useState } from 'react';
import { getVouchersByShop, updateVoucher, deleteVoucher, createVoucher } from '../api/voucherAPI';
import Swal from 'sweetalert2';
import Modal from 'react-modal';

// Cấu hình modal React

const VoucherManagement = () => {
    const [vouchers, setVouchers] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        voucherValue: '',
        startVoucher: '',
        endVoucher: '',
        numberUse: '',
        tvoucher: '',
        status: true,
    });
    const [tvouchers, setTvouchers] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch danh sách voucher và loại voucher
    useEffect(() => {
        fetchVouchers();
        fetchTvouchers();
    }, []);

    const fetchVouchers = async () => {
        try {
            const data = await getVouchersByShop();
            if (Array.isArray(data)) setVouchers(data);
            else Swal.fire('Lỗi', 'Dữ liệu trả về không hợp lệ!', 'error');
        } catch (error) {
            console.error('Lỗi khi lấy danh sách voucher:', error);
            Swal.fire('Lỗi', 'Không thể tải danh sách voucher', 'error');
        }
    };

    const fetchTvouchers = async () => {
        try {
            const data = [
                { id: '1', name: 'Quà tặng' },
                { id: '2', name: 'Giảm giá' },
                { id: '3', name: 'Hoàn tiền' },
            ];
            setTvouchers(data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách loại voucher:', error);
            Swal.fire('Lỗi', 'Không thể tải danh sách loại voucher', 'error');
        }
    };

    const validateVoucherData = (data) => {
        const { name, startVoucher, endVoucher, voucherValue, numberUse, tvoucher } = data;

        if (!name || !startVoucher || !endVoucher || !voucherValue || !tvoucher) {
            return 'Vui lòng điền đầy đủ thông tin!';
        }
        if (new Date(startVoucher) >= new Date(endVoucher)) {
            return 'Ngày bắt đầu phải trước ngày kết thúc!';
        }
        const numericValue = parseInt(voucherValue);
        if (isNaN(numericValue) || numericValue < 1 || (!voucherValue.endsWith('%') && numericValue > 100)) {
            return 'Giá trị voucher phải từ 1 và hợp lệ!';
        }
        const numberuser = parseInt(numberUse);
        if (isNaN(numberuser) || numberuser < 1) {
            return 'Số lần sử dụng phải từ 1 trở lên!';
        }
        if (vouchers.some((v) => v.name === name && v.id !== data.id)) {
            return 'Tên voucher đã tồn tại. Vui lòng chọn tên khác!';
        }
        return null;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditClick = (voucher) => {
        setFormData({
            id: voucher.id,
            name: voucher.name,
            voucherValue: voucher.voucherValue.replace('%', ''),
            startVoucher: new Date(voucher.startVoucher).toISOString().slice(0, 16),
            endVoucher: new Date(voucher.endVoucher).toISOString().slice(0, 16),
            numberUse: voucher.numberUse,
            tvoucher: voucher?.tvoucher?.id || '',
            status: voucher.status,
        });
        setIsEditing(true);
        setModalIsOpen(true);
    };

    const handleAddClick = () => {
        setFormData({
            name: '',
            voucherValue: '',
            startVoucher: '',
            endVoucher: '',
            numberUse: '',
            tvoucher: '',
            status: true,
        });
        setIsEditing(false);
        setModalIsOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const error = validateVoucherData(formData);
            if (error) {
                Swal.fire('Lỗi', error, 'error');
                return;
            }

            const formattedData = {
                ...formData,
                numberUse: parseInt(formData.numberUse),
                startVoucher: new Date(formData.startVoucher).toISOString(),
                endVoucher: new Date(formData.endVoucher).toISOString(),
                voucherValue: formData.voucherValue.endsWith('%')
                    ? formData.voucherValue
                    : `${formData.voucherValue}%`,
            };

            if (isEditing) {
                await updateVoucher(formData.id, formattedData);
                Swal.fire('Thành công', 'Cập nhật voucher thành công!', 'success');
            } else {
                await createVoucher(formattedData);
                Swal.fire('Thành công', 'Thêm voucher thành công!', 'success');
            }

            setModalIsOpen(false);
            fetchVouchers();
        } catch (error) {
            console.error('Lỗi khi xử lý voucher:', error);
            Swal.fire('Lỗi', 'Không thể xử lý voucher. Vui lòng thử lại.', 'error');
        }
    };

    const handleDeleteVoucher = async (id) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc chắn?',
            text: 'Voucher sẽ bị xóa vĩnh viễn!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            try {
                await deleteVoucher(id);
                fetchVouchers();
                Swal.fire('Đã xóa', 'Voucher đã được xóa.', 'success');
            } catch (error) {
                Swal.fire('Lỗi', 'Không thể xóa voucher.', 'error');
            }
        }
    };

    const calculateVoucherStatus = (start, end) => {
        const now = new Date();
        if (new Date(start) > now) return 'Chưa bắt đầu';
        if (new Date(end) < now) return 'Hết hạn';
        return 'Hoạt động';
    };

    const filteredVouchers = vouchers.filter((voucher) =>
        voucher.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container mt-4">
            <h2>Quản Lý Voucher</h2>
            <div className="mb-3 d-flex justify-content-between">
                <input
                    className="form-control w-50"
                    type="text"
                    placeholder="Tìm kiếm voucher"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="btn btn-primary" onClick={handleAddClick}>
                    Thêm Voucher
                </button>
            </div>
            <table className="table table-hover table-striped">
                <thead className="table-dark">
                    <tr>
                        <th>Tên Voucher</th>
                        <th>Giá Trị</th>
                        <th>Bắt Đầu</th>
                        <th>Kết Thúc</th>
                        <th>Số Lần Dùng</th>
                        <th>Loại Voucher</th>
                        <th>Trạng Thái</th>
                        <th>Thao Tác</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredVouchers.length > 0 ? (
                        filteredVouchers.map((voucher) => (
                            <tr key={voucher.id}>
                                <td>{voucher.name}</td>
                                <td>{voucher.voucherValue}</td>
                                <td>{voucher.startVoucher}</td>
                                <td>{voucher.endVoucher}</td>
                                <td>{voucher.numberUse}</td>
                                <td>{voucher.tvoucher ? voucher.tvoucher.name : 'Không xác định'}</td>
                                <td>
                                    <span
                                        className={`badge ${
                                            calculateVoucherStatus(voucher.startVoucher, voucher.endVoucher) === 'Hoạt động'
                                                ? 'bg-success'
                                                : 'bg-secondary'
                                        }`}
                                    >
                                        {calculateVoucherStatus(voucher.startVoucher, voucher.endVoucher)}
                                    </span>
                                </td>
                                <td>
                                    <button className="btn btn-warning btn-sm me-2" onClick={() => handleEditClick(voucher)}>
                                        Cập nhật
                                    </button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteVoucher(voucher.id)}>
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="text-center">Không có dữ liệu</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Modal Thêm/Cập nhật Voucher */}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                className="modal-content"
                overlayClassName="modal-overlay"
            >
                <h2 className="text-center">{isEditing ? 'Cập nhật Voucher' : 'Thêm Voucher'}</h2>
                <div className="form-group">
                    <label>Tên Voucher</label>
                    <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label>Giá Trị Voucher</label>
                    <input
                        type="text"
                        className="form-control"
                        name="voucherValue"
                        value={formData.voucherValue}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label>Ngày Bắt Đầu</label>
                    <input
                        type="datetime-local"
                        className="form-control"
                        name="startVoucher"
                        value={formData.startVoucher}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label>Ngày Kết Thúc</label>
                    <input
                        type="datetime-local"
                        className="form-control"
                        name="endVoucher"
                        value={formData.endVoucher}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label>Số Lần Dùng</label>
                    <input
                        type="number"
                        className="form-control"
                        name="numberUse"
                        value={formData.numberUse}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label>Loại Voucher</label>
                    <select
                        className="form-control"
                        name="tvoucher"
                        value={formData.tvoucher}
                        onChange={handleInputChange}
                    >
                        <option value="">Chọn loại voucher</option>
                        {tvouchers.map((tv) => (
                            <option key={tv.id} value={tv.id}>
                                {tv.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="d-flex justify-content-between mt-3">
                    <button className="btn btn-secondary" onClick={() => setModalIsOpen(false)}>
                        Đóng
                    </button>
                    <button className="btn btn-success" onClick={handleSubmit}>
                        {isEditing ? 'Cập nhật' : 'Thêm'}
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default VoucherManagement;
