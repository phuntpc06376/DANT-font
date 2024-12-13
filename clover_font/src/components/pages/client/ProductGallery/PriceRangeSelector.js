import Slider from 'rc-slider';
import 'rc-slider/assets/index.css'; // CSS cho slider
import React, { useState } from 'react';

// Hàm để định dạng tiền tệ
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const PriceRangeSelector = ({ minPrice, maxPrice, setMinPrice, setMaxPrice }) => {
  const [range, setRange] = useState([minPrice || 0, maxPrice || 100000]);

  const handleSliderChange = (value) => {
    setRange(value);
    setMinPrice(value[0]);
    setMaxPrice(value[1]);
  };

  // Hàm xử lý khi người dùng nhập giá trị vào input
  const handleInputChange = (index, value) => {
    const newValue = value.replace(/[^\d]/g, ''); // Chỉ giữ lại số
    const newRange = [...range];
    newRange[index] = newValue ? parseInt(newValue, 10) : 0; // Cập nhật giá trị range
    setRange(newRange);
    index === 0 ? setMinPrice(newRange[0]) : setMaxPrice(newRange[1]);
  };

  return (
    <div className="price-range-selector">
      <div className="d-flex justify-content-between align-items-center mb-2">
        {/* Input fields với định dạng tiền tệ */}
        <input
          type="text"
          value={formatPrice(range[0])}
          onChange={(e) => handleInputChange(0, e.target.value)}
          className="form-control"
          style={{ width: '45%' }}
        />
        <input
          type="text"
          value={formatPrice(range[1])}
          onChange={(e) => handleInputChange(1, e.target.value)}
          className="form-control"
          style={{ width: '45%' }}
        />
      </div>

      {/* Price Range Slider */}
      <Slider
        range
        min={0}
        max={50000000} // Giá tối đa
        step={100} // Bước nhảy
        value={range}
        onChange={handleSliderChange}
        trackStyle={{ backgroundColor: 'green' }}
        handleStyle={{ borderColor: 'green' }}
      />

      {/* Hiển thị khoảng giá đã chọn dưới dạng tiền tệ */}
      {/* <div className="price-range-labels mt-2 d-flex justify-content-between">
        <span>{formatPrice(range[0])}</span>
        <span>{formatPrice(range[1])}</span>
      </div> */}
    </div>
  );
};

export default PriceRangeSelector;
