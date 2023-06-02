const deleteProduct = (btn) => {
  const productId = btn.parentNode.querySelector('[name=productId').value
  const csrfToken = btn.parentNode.querySelector('[name=_csrf').value
  const productElement = btn.closest('article')

  fetch('/admin/delete-product/'+ productId, {
    method: 'DELETE',
    headers: {
      'csrf-token': csrfToken
    }
  })
    .then(result => {
      return result.json()
    })
    .then(data => {
      console.log(data)
      // productElement.remove()
      productElement.parentNode.removeChild(productElement) // this redundancy due to internet explorer does not support remove()
    })
    .catch(err => {
      console.log(err)
    })
}