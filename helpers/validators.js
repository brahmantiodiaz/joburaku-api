function requiredMessage(fieldName) {
  return `${fieldName} is required`;
}

function required(fieldName) {
  return {
    notNull: { msg: requiredMessage(fieldName) },
    notEmpty: { msg: requiredMessage(fieldName) },
  };
}

function requiredInteger(fieldName, minValue = null) {
  const validate = {
    notNull: { msg: requiredMessage(fieldName) },
    isInt: { msg: `${fieldName} must be an integer` },
  };

  if (minValue !== null) {
    validate.min = {
      args: [minValue],
      msg: `${fieldName} minimum is ${minValue}`,
    };
  }

  return validate;
}

function urlOrEmpty(fieldName) {
  return {
    isUrlOrEmpty(value) {
      if (value && !/^https?:\/\/.+/.test(value)) {
        throw new Error(`${fieldName} format is invalid`);
      }
    },
  };
}

module.exports = { required, requiredInteger, urlOrEmpty };
