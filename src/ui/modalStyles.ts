// Mantine's Modal in the site's colours rather than its default grey: the
// same deep green as the suggestion dropdowns (css/UsernameAutocomplete).
export const brandModalStyles = {
  content: {
    background: 'light-dark(#f6fcf9, #10261d)',
    border:
      '1px solid light-dark(rgba(52, 163, 126, 0.3), rgba(110, 231, 183, 0.18))',
  },
  header: {
    background: 'light-dark(#f6fcf9, #10261d)',
  },
  overlay: {
    backdropFilter: 'blur(3px)',
  },
}
