const listBtnChangeStatus = document.querySelectorAll("[button-change-status]")
if (listBtnChangeStatus.length > 0) {
    const formChangeStatus = document.querySelector("#form-change-status")
    const path = formChangeStatus.getAttribute("data-path")
    // console.log(path)
    listBtnChangeStatus.forEach(button => {
        button.addEventListener("click", () => {
            const dataId = button.getAttribute("data-id")
            let status = ""
            const dataStatus = button.getAttribute("data-status")
            if (dataStatus == "active") {
                status = "inactive"
            } else {
                status = "active"
            }
            const action = `${path}/${status}/${dataId}?_method=PATCH`
            formChangeStatus.action = action
            formChangeStatus.submit()
        })
    })
}