// Button change status 
const listBtnChangeStatus = document.querySelectorAll("[button-change-status]")
if (listBtnChangeStatus.length > 0) {
    const formChangeStatus = document.querySelector("[form-change-status]")
    const path = formChangeStatus.getAttribute("data-path")
    listBtnChangeStatus.forEach(button => {
        button.addEventListener("click", () => {
            const id = button.getAttribute("data-id")
            let currentStatus = button.getAttribute("data-status")
            if (currentStatus == "active") {
                currentStatus = "inactive"
            } else {
                currentStatus = "active"
            }
            const action = `${path}/${currentStatus}/${id}?_method=PATCH`
            formChangeStatus.action = action
            formChangeStatus.submit()
        })
    })
}
// End button change status 

// Button delete song
const listBtnDelete = document.querySelectorAll("[button-delete]")
if (listBtnDelete.length > 0) {
    const formDeleteItem = document.querySelector("[form-delete-item]")
    const path = formDeleteItem.getAttribute("data-path")
    console.log(path)
    listBtnDelete.forEach(button => {
        button.addEventListener("click", () => {
            const confirmDelete = confirm("Bạn có chắc chắn muốn xóa chủ đề này không?")

            if (!confirmDelete) {
                return
            }

            const dataId = button.getAttribute("data-id")
            const action = `${path}/${dataId}/?_method=DELETE`
            formDeleteItem.action = action

            formDeleteItem.submit()
        })
    })
}
// End button delete song 
