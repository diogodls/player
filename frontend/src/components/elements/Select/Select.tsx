import styles from "./Select.module.scss";
import type { ChangeEvent } from "react";
import type { SelectValue, SelectProps } from './index.ts';

const Select = <TValue extends SelectValue = string>({
  value,
  options,
  onChange,
  placeholder,
  label,
  disabled = false,
  className = "",
  name,
  id,
  ...selectProps
}: SelectProps<TValue>) => {
  const selectId = id ?? name;
  const rootClassName = [styles.field, className].filter(Boolean).join(" ");

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = options.find((option) => String(option.value) === event.target.value);
    onChange(selectedOption ? selectedOption.value : "", event);
  };

  return (
    <div className={rootClassName}>
      {label && <label className={styles.label} htmlFor={selectId}>{label}</label>}

      <select
        {...selectProps}
        id={selectId}
        name={name}
        className={styles.select}
        value={String(value)}
        onChange={handleChange}
        disabled={disabled}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={String(option.value)} value={String(option.value)} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
