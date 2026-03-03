/**
 * validate.js
 * Lightweight validation middleware — no extra dependencies.
 * Uses plain JS to validate request bodies and returns
 * consistent { message, errors } responses on failure.
 */

/* ── helpers ── */
const isEmpty  = (v) => v === undefined || v === null || String(v).trim() === '';
const isEmail  = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v));
const isNumber = (v) => !isNaN(parseFloat(v)) && isFinite(v);
const isPositive = (v) => isNumber(v) && parseFloat(v) >= 0;

/**
 * buildValidator(rules)
 * rules: array of { field, label?, checks: [ {test, msg} ] }
 * Returns an Express middleware.
 */
function buildValidator(rules) {
  return (req, res, next) => {
    const errors = [];

    for (const rule of rules) {
      const value = req.body[rule.field];
      for (const check of rule.checks) {
        if (!check.test(value)) {
          errors.push({ field: rule.field, message: check.msg });
          break; // one error per field
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: errors[0].message,   // first error as top-level message
        errors,
      });
    }

    next();
  };
}

/* ─────────────────────────────────────
   Auth validators
───────────────────────────────────── */
const validateRegister = buildValidator([
  {
    field: 'name',
    checks: [
      { test: (v) => !isEmpty(v),      msg: 'Name is required.' },
      { test: (v) => String(v).trim().length >= 2, msg: 'Name must be at least 2 characters.' },
    ],
  },
  {
    field: 'email',
    checks: [
      { test: (v) => !isEmpty(v),  msg: 'Email is required.' },
      { test: (v) => isEmail(v),   msg: 'Please provide a valid email address.' },
    ],
  },
  {
    field: 'password',
    checks: [
      { test: (v) => !isEmpty(v),              msg: 'Password is required.' },
      { test: (v) => String(v).length >= 6,    msg: 'Password must be at least 6 characters.' },
    ],
  },
]);

const validateLogin = buildValidator([
  {
    field: 'email',
    checks: [
      { test: (v) => !isEmpty(v), msg: 'Email is required.' },
      { test: (v) => isEmail(v),  msg: 'Please provide a valid email address.' },
    ],
  },
  {
    field: 'password',
    checks: [
      { test: (v) => !isEmpty(v), msg: 'Password is required.' },
    ],
  },
]);

/* ─────────────────────────────────────
   Inventory validators
───────────────────────────────────── */
const validateInventoryItem = buildValidator([
  {
    field: 'name',
    checks: [
      { test: (v) => !isEmpty(v),           msg: 'Product name is required.' },
      { test: (v) => String(v).trim().length >= 2, msg: 'Product name must be at least 2 characters.' },
      { test: (v) => String(v).trim().length <= 100, msg: 'Product name must be under 100 characters.' },
    ],
  },
  {
    field: 'quantity',
    checks: [
      { test: (v) => !isEmpty(v),  msg: 'Quantity is required.' },
      { test: (v) => isNumber(v),  msg: 'Quantity must be a number.' },
      { test: (v) => parseInt(v) >= 0, msg: 'Quantity cannot be negative.' },
    ],
  },
  {
    field: 'costPrice',
    checks: [
      { test: (v) => !isEmpty(v),    msg: 'Cost price is required.' },
      { test: (v) => isPositive(v),  msg: 'Cost price must be a non-negative number.' },
    ],
  },
  {
    field: 'sellingPrice',
    checks: [
      { test: (v) => !isEmpty(v),    msg: 'Selling price is required.' },
      { test: (v) => isPositive(v),  msg: 'Selling price must be a non-negative number.' },
    ],
  },
]);

/* ─────────────────────────────────────
   Order validators
───────────────────────────────────── */
const validateOrder = buildValidator([
  {
    field: 'items',
    checks: [
      { test: (v) => Array.isArray(v) && v.length > 0, msg: 'Order must contain at least one item.' },
    ],
  },
  {
    field: 'totalAmount',
    checks: [
      { test: (v) => !isEmpty(v),    msg: 'Total amount is required.' },
      { test: (v) => isPositive(v),  msg: 'Total amount must be a non-negative number.' },
    ],
  },
]);

module.exports = {
  buildValidator,
  validateRegister,
  validateLogin,
  validateInventoryItem,
  validateOrder,
};
