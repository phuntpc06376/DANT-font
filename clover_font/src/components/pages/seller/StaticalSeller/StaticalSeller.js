import React, { useEffect, useState } from 'react';
import { getAllStaticalSellers } from '../api/staticalSellerApi'; // Đường dẫn tới file API
import productService from '../api/productApi'; // Đường dẫn tới productService
import 'bootstrap/dist/css/bootstrap.min.css';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faArrowLeft, faArrowRight, faChartBar } from '@fortawesome/free-solid-svg-icons';

const StaticalSeller = () => {
    const [staticalSellers, setStaticalSellers] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Trạng thái cho các trường nhập liệu
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [shopId, setShopId] = useState('');

    // Trạng thái cho lỗi ngày
    const [dateError, setDateError] = useState('');

    // Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Hàm gộp dữ liệu theo ngày
    const groupByDate = (data) => {
        const grouped = data.reduce((acc, item) => {
            const { buyDay, discount, totalPayment } = item;

            if (!acc[buyDay]) {
                acc[buyDay] = {
                    buyDay,
                    discount: 0,
                    totalPayment: 0,
                    netRevenue: 0, // Thêm trường netRevenue
                };
            }

            acc[buyDay].discount += discount;
            acc[buyDay].totalPayment += totalPayment;
            acc[buyDay].netRevenue += (totalPayment - discount); // Tính toán netRevenue

            return acc;
        }, {});

        return Object.values(grouped); // Chuyển về mảng
    };

    // Hàm lấy dữ liệu API cho thống kê
    const fetchStaticalSellers = async (filterStartDate, filterEndDate, filterShopId) => {
        setLoading(true);
        try {
            const data = await getAllStaticalSellers(filterStartDate, filterEndDate, filterShopId);
            const groupedData = groupByDate(data); // Gộp dữ liệu
            setStaticalSellers(groupedData);
            setError(null);
        } catch (err) {
            setError('Có lỗi xảy ra. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    // Lấy shopId từ API sản phẩm
    useEffect(() => {
        const fetchShopId = async () => {
            try {
                const products = await productService.getProductsBySeller();
                const firstProduct = products[0];
                if (firstProduct) {
                    setShopId(firstProduct.shopId); // Giả sử shopId là thuộc tính trong sản phẩm
                }
            } catch (err) {
                console.error('Error fetching products:', err);
            }
        };

        fetchShopId();
    }, []);

    useEffect(() => {
        // Gọi API thống kê ngay khi shopId có giá trị
        if (shopId) {
            // Kiểm tra nếu startDate và endDate chưa được chọn, hãy gán giá trị mặc định
            if (!startDate || !endDate) {
                const today = new Date().toISOString().split('T')[0]; // Ngày hiện tại theo định dạng YYYY-MM-DD
                setStartDate(today);
                setEndDate(today);
            }
            fetchStaticalSellers(startDate, endDate, shopId);
        }
    }, [shopId, startDate, endDate]); // Gọi lại khi shopId, startDate, hoặc endDate thay đổi

    const handleFilter = (e) => {
        e.preventDefault();
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            setDateError('Ngày bắt đầu không thể lớn hơn ngày kết thúc.');
            return;
        }
        setDateError('');
        fetchStaticalSellers(startDate, endDate, shopId);
        setCurrentPage(1);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentSellers = staticalSellers.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(staticalSellers.length / itemsPerPage);

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4">
                <FontAwesomeIcon icon={faChartBar} className="me-2 text-primary" />
                Thống kê người bán
            </h2>

            <form onSubmit={handleFilter} className="mb-4">
                <div className="row g-3">
                    <div className="col-md-4">
                        <label htmlFor="startDate" className="form-label">Ngày bắt đầu:</label>
                        <input
                            type="date"
                            id="startDate"
                            className="form-control"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="endDate" className="form-label">Ngày kết thúc:</label>
                        <input
                            type="date"
                            id="endDate"
                            className="form-control"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>
                <button type="submit" className="btn btn-primary mt-3 w-100">
                    <FontAwesomeIcon icon={faFilter} className="me-2" />
                    Lọc
                </button>
                {dateError && <p className="text-danger mt-2">{dateError}</p>}
            </form>

            {loading && <p className="text-center">Đang tải dữ liệu...</p>}
            {error && <p className="text-danger text-center">{error}</p>}

            {!loading && currentSellers.length > 0 && (
                <>
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>Ngày</th>
                                <th>Tổng chiết khấu</th>
                                <th>Tổng doanh thu</th>
                                <th>Doanh thu sau chiết khấu</th> {/* Thêm cột này */}
                            </tr>
                        </thead>
                        <tbody>
                            {currentSellers.map((seller, index) => (
                                <tr key={index}>
                                    <td>{seller.buyDay}</td>
                                    <td>{seller.discount}</td>
                                    <td>{seller.totalPayment}</td>
                                    <td>{seller.netRevenue}</td> {/* Hiển thị netRevenue */}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <button
                            className="btn btn-secondary"
                            onClick={prevPage}
                            disabled={currentPage === 1}
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                            Trang trước
                        </button>
                        <span>Trang {currentPage} / {totalPages}</span>
                        <button
                            className="btn btn-secondary"
                            onClick={nextPage}
                            disabled={currentPage === totalPages}
                        >
                            Trang sau
                            <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                        </button>
                    </div>

                    <ResponsiveContainer width="100%" height={400} className="mt-4">
                        <BarChart data={currentSellers}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="buyDay" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="netRevenue" fill="#28a745" name="Doanh thu sau chiết khấu" /> {/* Sử dụng netRevenue */}
                        </BarChart>
                    </ResponsiveContainer>
                </>
            )}

            {!loading && currentSellers.length === 0 && !error && (
                <p className="text-center">Không có dữ liệu hiển thị.</p>
            )}
        </div>
    );
};

export default StaticalSeller;
