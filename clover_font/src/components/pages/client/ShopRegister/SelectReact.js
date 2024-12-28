import React from "react";
import Select from "react-select";

const SelectReact = ({ options, value, onChange, placeholder, isDisabled }) => {
    return (
        <Select
            options={options}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            isDisabled={isDisabled}
        />
    );
};

export default SelectReact;
