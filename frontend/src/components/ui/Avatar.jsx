import { getInitials } from '../../utils/format';

function Avatar({ name, size }) {
  return (
    <span className={`avatar${size ? ` avatar--${size}` : ''}`} aria-hidden="true">
      {getInitials(name)}
    </span>
  );
}

export default Avatar;
