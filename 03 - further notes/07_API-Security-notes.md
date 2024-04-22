# API Security Notes

# 1. Logout To Clear Token Cookie
- uncommented else if block to check for a cookie
``` JS middleware/auth.js
else if(req.cookies.token) {
  token = req.cookies.token;
}
```
  - This means even if we don't specify the bearer token in the header we will use the cookie to remember which accoun is logged in.

## Logout route
- added `logout` handler to `controllers/auth.js`
``` JS controllers/auth.js
// @desc    Log user out / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expired: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'User logged out',
    data: {}
  })
});
```
- Added logout route to `routes/auth.js`
``` JS routes/auth.js
// Logout
router.get('/logout', logout);
```

- Commented the cookies check again for now