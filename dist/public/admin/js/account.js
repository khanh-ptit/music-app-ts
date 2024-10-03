// Button change status
const listButtonChangeStatus = document.querySelectorAll("[button-change-status]");
if (listButtonChangeStatus.length > 0) {
    listButtonChangeStatus.forEach(button => {
        button.addEventListener("click", () => {
            const id = button.getAttribute("data-id");
            let currentStatus = button.getAttribute("data-status");
            if (currentStatus == "active") {
                currentStatus = "inactive";
            } else {
                currentStatus = "active";
            }

            const link = `accounts/change-status/${currentStatus}/${id}`;
            console.log(link)

            const option = {
                method: "PATCH"
            };

            fetch(link, option)
                .then(res => res.json())
                .then(data => {
                    if (data.code == 200) {
                        if (data.status === "active") {
                            button.classList.remove("badge-danger");
                            button.classList.add("badge-success");
                            button.textContent = "Hoạt động";
                            button.setAttribute("data-status", "active");
                        } else {
                            button.classList.remove("badge-success");
                            button.classList.add("badge-danger");
                            button.textContent = "Dừng hoạt động";
                            button.setAttribute("data-status", "inactive");
                        }
                        toastr.success(data.message); // Hiển thị thông báo Toastr
                    } else if (data.code == 404) {
                        toastr.warning(data.message); // Hiển thị thông báo Toastr
                    } else if (data.code == 400) {
                        toastr.error(data.message);
                    }
                })
                .catch(err => {
                    toastr.error("Đã xảy ra lỗi!"); // Hiển thị lỗi với Toastr
                });
        });
    });
}
// End button change status
