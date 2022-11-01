


const todosAcess = new TodosAccess()

// TODO: Implement businessLogic

export async function createTodo(
    createTodoRequest:CreateTodoRequest, 
    userId:string) :Promise<TodoItem> {
    const todoId = uuid.v4()
    
    return todosAcess.createTodo({
        todoId:todoId,
        userId: userId,
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        attachmentUrl: '',
        done: false,
        createdAt: new Date().toISOString()  
    })
}

export async function getTodosForUser(userId: string) {
    return todosAcess.getTodosForUser(userId)    
}

export async function deleteTodo(userId: string, todoId: string){
    return todosAcess.deleteTodo(userId, todoId)
}

export async function updateTodo(updateTodoRequest:UpdateTodoRequest, todoId: string, userId: string) {
    return todosAcess.updateTodo(updateTodoRequest, todoId, userId)   
}

export async function createAttachmentPresignedUrl(todoId:string) {
    return getUploadUrl(todoId)    
}