import React, { useEffect, useState } from 'react';
import { getAllStaticalAds } from '../api/stacticialAdApi'; // Import hàm API
import 'bootstrap/dist/css/bootstrap.min.css';
import './StaticalAd.css'; // Thêm CSS tùy chỉnh
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

const StaticalAd = () => {
    const [staticalAds, setStaticalAds] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false); // Trạng thái loading

    // Trạng thái cho các trường nhập liệu
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [nameShop, setShopId] = useState('');

    // Thêm trạng thái lỗi cho ngày
    const [dateError, setDateError] = useState('');

    // Trạng thái cho phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Số lượng items trên mỗi trang

    const fetchStaticalAds = async (filterStartDate, filterEndDate, filterShopId) => {
        setLoading(true);
        try {
            const data = await getAllStaticalAds(filterStartDate, filterEndDate, filterShopId);
            setStaticalAds(data);
            setError(null);
        } catch (err) {
            setError('Có lỗi xảy ra. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaticalAds(startDate, endDate, nameShop);
    }, []);

    const handleFilter = (e) => {
        e.preventDefault();

        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            setDateError('Ngày bắt đầu không thể lớn hơn ngày kết thúc.');
            return;
        } else {
            setDateError('');
        }

        fetchStaticalAds(startDate, endDate, nameShop);
        setCurrentPage(1);
    };

    const groupByDateAndShop = (ads) => {
        return ads.reduce((acc, current) => {
            const { buyDay, nameShop, discount, totalPayment } = current;
            const key = `${buyDay}-${nameShop}`;

            if (!acc[key]) {
                acc[key] = {
                    buyDay,
                    nameShop,
                    totalDiscount: 0,
                    totalPayment: 0
                };
            }

            acc[key].totalDiscount += discount;
            acc[key].totalPayment += totalPayment;

            return acc;
        }, {});
    };

    const groupedAds = Object.values(groupByDateAndShop(staticalAds));

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAds = groupedAds.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(groupedAds.length / itemsPerPage);

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
        <div className="statical-ad-container">
            <h2 className="statical-ad-title">
                <FontAwesomeIcon icon={faChartBar} className="me-2" style={{ color: "#007bff" }} />
                Thống kê
            </h2>

            <form onSubmit={handleFilter} className="statical-ad-form">
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
                    <div className="col-md-4">
                        <label htmlFor="nameShop" className="form-label">Tên Shop:</label>
                        <input
                            type="text"
                            id="nameShop"
                            className="form-control"
                            value={nameShop}
                            onChange={(e) => setShopId(e.target.value)}
                        />
                    </div>
                </div>
                <button type="submit" className="btn btn-primary mt-3 w-100">
                    <FontAwesomeIcon icon={faFilter} className="me-2" />
                    Lọc
                </button>
                {dateError && <p className="statical-ad-date-error">{dateError}</p>}
            </form>

            {loading && <p className="statical-ad-loading">Đang tải dữ liệu...</p>}
            {error && <p className="statical-ad-error">{error}</p>}

            {!loading && currentAds.length > 0 && (
                <>
                    <table className="table table-bordered mt-3 statical-ad-table">
                        <thead>
                            <tr>
                                <th scope="col">Ngày mua</th>
                                <th scope="col">Tên Shop</th>
                                <th scope="col">Tổng Chiết khấu</th>
                                <th scope="col">Tổng thanh toán</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentAds.map((ad) => (
                                <tr key={`${ad.buyDay}-${ad.nameShop}`}>
                                    <td>{ad.buyDay}</td>
                                    <td>{ad.nameShop}</td>
                                    <td>{ad.totalDiscount}</td>
                                    <td>{ad.totalPayment}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="statical-ad-pagination">
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

                    <div className="statical-ad-chart">
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={currentAds}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey={(ad) => `${ad.nameShop} - ${ad.buyDay}`} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="totalDiscount" fill="#82ca9d" name="Tổng Chiết khấu" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}

            {!loading && currentAds.length === 0 && !error && (
                <p className="text-center mt-3">Không có dữ liệu hiển thị.</p>
            )}
        </div>
    );
};

export default StaticalAd;
