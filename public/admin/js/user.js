// Button change status
const listButtonChangeStatus = document.querySelectorAll("[button-change-status]");
if (listButtonChangeStatus.length > 0) {
    listButtonChangeStatus.forEach(button => {
        button.addEventListener("click", () => {
            let status = button.getAttribute("data-status");
            const id = button.getAttribute("data-id");

            // Toggle status between active and inactive
            status = (status === "active") ? "inactive" : "active";

            const link = `/admin/users/change-status/${status}/${id}`;
            const option = {
                method: "PATCH"
            };

            fetch(link, option)
                .then(res => res.json())
                .then(data => {
                    if (data.code === 200) {
                        // Update button based on new status
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
                        toastr.success(data.message);

                        // Optional: Reload the page after a delay (uncomment if needed)
                        // setTimeout(() => {
                        //     window.location.reload();
                        // }, 5000);
                    } else {
                        toastr.error(data.message);
                    }
                })
                .catch(err => {
                    toastr.error("Đã xảy ra lỗi trong quá trình kết nối với server!");
                });
        });
    });
}
// End button change status


// Button delete
const listButtonDelete = document.querySelectorAll("[button-delete]")
if (listButtonDelete.length > 0) {
    listButtonDelete.forEach(button => {
        button.addEventListener("click", () => {
            Swal.fire({
                title: 'Bạn có chắc chắn muốn xóa bản ghi này?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Xóa',
                cancelButtonText: 'Hủy'
            }).then((result) => {
                if (!result.isConfirmed) {
                    return
                }
                const id = button.getAttribute("data-id")
                
                const link = `users/delete/${id}`
                const option = {
                    method: "DELETE"
                }

                fetch(link, option)
                    .then(res => res.json())
                    .then(data => {
                        if (data.code == 200) {
                            button.closest('tr').remove(); // Xóa dòng tương ứng
                            Swal.fire({
                                title: 'Thành công!',
                                text: data.message,
                                icon: 'success',
                                confirmButtonText: 'OK'
                            }).then(() => {
                                // Khi người dùng bấm OK, load lại trang
                                window.location.reload(); // Reload lại trang hiện tại
                            });
                        } else {
                            Swal.fire('Lỗi!', data.message, 'error');
                        }
                    })
            })  
        })
    })
}
// End button delete