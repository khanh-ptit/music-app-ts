const listButtonDelete = document.querySelectorAll("[button-delete]")
if (listButtonDelete.length > 0) {
    const formDeleteItem = document.querySelector("[form-delete-item]")
    const path = formDeleteItem.getAttribute("data-path")
    listButtonDelete.forEach(button => {
        button.addEventListener("click", () => {
            const confirmDelete = confirm("Bạn có chắc chắn muốn xóa nhóm quyền này?")
            if (!confirmDelete) {
                return
            }
            const id = button.getAttribute("button-delete")
            const action = `${path}/${id}?_method=DELETE`
            // console.log(action)
            formDeleteItem.action = action
            formDeleteItem.submit()
        })
    })
}