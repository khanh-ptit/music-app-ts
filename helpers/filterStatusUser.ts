export default (query: Record<string, any>) => {
    let filterStatus = [{
            name: "Tất cả",
            status: "",
            class: ""
        },
        {
            name: "Hoạt động",
            status: "active",
            class: ""
        },
        {
            name: "Dừng hoạt động",
            status: "inactive",
            class: ""
        },
        {
            name: "Khởi tạo",
            status: "initial",
            class: ""
        }
    ]

    if (query.status) {
        const index = filterStatus.findIndex(item => item.status == query.status)
        filterStatus[index].class = "active"
    } else {
        const index = filterStatus.findIndex(item => item.status == "")
        filterStatus[index].class = "active"
    }

    return filterStatus
}