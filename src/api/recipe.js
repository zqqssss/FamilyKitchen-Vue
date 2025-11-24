import request from '@/utils/request'

// 1. 分页查询
export const getRecipePage = (params) => {
    return request({
        url: '/recipe/page',
        method: 'get',
        params // 包含 page, pageSize, title, category
    })
}

// 2. 新增菜品
export const addRecipe = (data) => {
    return request({
        url: '/recipe/add',
        method: 'post',
        data
    })
}

// 3. 修改菜品
export const updateRecipe = (data) => {
    return request({
        url: '/recipe/update',
        method: 'post',
        data
    })
}

// 4. 删除菜品
// 后端使用 @RequestParam Long id，所以这里使用 params 拼接到 URL 上，或者用 form-data
export const deleteRecipe = (id) => {
    return request({
        url: '/recipe/delete',
        method: 'post',
        params: { id } // 这会将请求变成 /recipe/delete?id=xxx
    })
}
