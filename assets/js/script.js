// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

// set up date picker
$('#taskDueDate').datepicker({})

// Todo: create a function to generate a unique task id
function generateTaskId() {
    // If we don't have a nextId in our local storage, set the variable to 0
    if (!nextId) {
        nextId = 0
    }
    // save it to local storage, and return our newId
    const newId = nextId;
    nextId++;
    localStorage.setItem('nextId', JSON.stringify(nextId));
    return newId;
}

// Todo: create a function to create a task card
function createTaskCard(task) {
    // If don't have a task list from local storage, then abort the function
    if (!taskList) {
        return
    }
    // create the HTML elements for each card using the data that was input in our modal form, and then give them attributes
    const taskCard = document.createElement('div');
    taskCard.setAttribute('class','taskCard');
    let taskId = task.id
    taskCard.setAttribute('id', `taskId-${taskId}`)

    const taskCardHeader = document.createElement('div')
    taskCardHeader.setAttribute('class','taskCardHeader')
    const cardDeleteButton = document.createElement('button')
    cardDeleteButton.textContent = 'Delete'
    cardDeleteButton.setAttribute('class','cardDeleteButton')
    cardDeleteButton.addEventListener('click', handleDeleteTask);

    const taskTitle = document.createElement('h3');
    taskTitle.textContent = task.title;
    taskTitle.setAttribute('id','taskTitle');

    const taskDueDate = document.createElement('p');
    taskDueDate.textContent = 'Due Date:' +" "+ task.dueDate;
    taskDueDate.setAttribute('id','taskDueDate');

    const taskDescription = document.createElement('p');
    taskDescription.textContent = task.description;
    taskDescription.setAttribute('id','taskDescription');

    taskCard.setAttribute('id', `taskId-${taskId}`)
    // append each element
    taskCardHeader.appendChild(taskTitle);
    taskCard.appendChild(cardDeleteButton);
    taskCard.appendChild(taskCardHeader);
    taskCard.appendChild(taskDueDate);
    taskCard.appendChild(taskDescription);
    
    //locate the status of the task and append it to the column that correspond
    const taskStatus = task.status
    let taskColumnPick = document.getElementById(`${taskStatus}-cards`)
    taskColumnPick.appendChild(taskCard);
    // call our renderTaskList function to make cards instantly draggable
    renderTaskList();
    // We color the cards based on their due date using dayjs widget
    function updateTaskCardColor(task) {
        const taskCard = document.getElementById(`taskId-${task.id}`);
        if (taskCard) {
            const dueDate = dayjs(task.dueDate);
            const currentDate = dayjs();
            const dayDifference = dueDate.diff(currentDate, 'day');
            if (dayDifference <= 0) {
                taskCard.classList.add('past-due');
            } else if (dayDifference <= 3) {
                taskCard.classList.add('due-soon');
            } else { taskCard.classList.add('due-later')}
        };
    };
    //call the function to update the colors
    updateTaskCardColor(task);
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
    // We give the cards the draggable attribute using our jQuery UI
     
    $('.taskCard').draggable({
        revert: 'invalid',
        zIndex: 100,
        connectToSortable: '.lane',
    });
    //make sure that they return to where they were dragged from if they're dropped to an invalid location
    $('#to-do-cards').sortable({
        appendTo: document.body
    });
    // We make our task cards sortable between each other and append them to their respective positions in the HTML
}

// Todo: create a function to handle adding a new task
function handleAddTask(event) {
    // prevents the page from reloading when click our button
    event.preventDefault();
    // gathers the inputs from our form and stores them as variables
    const title = $('#taskTitle').val().trim();
    const dueDateStr = $('#taskDueDate').datepicker('getDate');
    const description = $('#taskDescription').val().trim();
   
    //this makes sure the date is displayed without a time or timezone attached
    const dueDateISO = dueDateStr.toISOString().split('T')[0];
    
    // declare a dueDate variable
    const dueDate = dayjs(dueDateISO)
    // creates a JS object with the inputs
    const newTask = {
      id: generateTaskId(),
      title: title,
      dueDate: dueDate.format('MM-DD-YYYY'),
      description: description,
      status: 'to-do'
    };
  
    // states that if don't have a task list, create an empty object for it
    if (!taskList) {
      taskList = [];
    }
    // push the new task object to the task list
    taskList.push(newTask);
    // stringifies the object and pushes it to local storage
    localStorage.setItem('tasks', JSON.stringify(taskList));
    // call the createTaskCard function to make the task card
    createTaskCard(newTask);
    
    // closes the modal and clears the form
    $('#formModal').modal('hide');
    $('#taskForm').trigger('reset');
  }
  

// Todo: create a function to handle deleting a task
function handleDeleteTask(event){
    //defines a button click event, retrieves the nearest task card element related to the clicked button,
    // and extracts the task ID as a numerical string.
    const deleteButton = event.target;
    const taskCard = deleteButton.closest('.taskCard');
    const taskId = taskCard.id.replace('taskId-', '')
    // parses the number string of the ID to identify the index the task card that are deleting 
    const taskIndex = taskList.findIndex(task => task.id === parseInt(taskId));
    // If have a valid task index number, then splice that task from the local storage and save local storage
    if (taskIndex !== -1) {
        taskList.splice(taskIndex, 1); 
        localStorage.setItem('tasks', JSON.stringify(taskList));
    }
    //removes the targeted task card from the DOM
    taskCard.remove();
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    // stops any propagation through the HTML elements after dropping
    event.stopPropagation();
    // identifies the ID of the task that it's drag and then replaces the status 
    // of the task to match the lane that is dropped into
    const taskId = ui.draggable.attr('id').replace('taskId-', '');
    const newStatus = $(this).attr('id');
  
    // finds the task and identifies its taskId, update it in local storage 
    // If it's not founded, it returns a -1
    const taskIndex = taskList.findIndex((task) => task.id === parseInt(taskId));  
    if (taskIndex !== -1) {
        taskList[taskIndex].status = newStatus;
        localStorage.setItem('tasks', JSON.stringify(taskList));
    };
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    // render the tasks from our local storage
    function renderTasksFromLocalStorage() {
        // check if there is data stored in our local storage, and create a task card for each task
        if (taskList) {
            taskList.forEach((task, index) => {
                createTaskCard(taskList[index]); 
            });
        }
    }
    // call the function
    renderTasksFromLocalStorage()
    // call renderTaskList function to make cards draggable, droppable, and sortable
    renderTaskList();
    // the elements within lanes sortable
    $('.lane').sortable({
        connectWith: '.lane',
        tolerance: 'pointer',
        handle: '.taskCardHeader',
        cursor: 'move',
        placeholder: 'taskCard-placeholder'
    })
    // make lanes droppable for the cards
    $('.lane').droppable({
        accept: '.taskCard',
        drop: handleDrop,
    });
    // show the modal form when is click on the "Add Task" button
    $('#addTaskButton').click(function() {
        $('#formModal').modal('show');
    });
    // call handleAddTask function when is click the "Create Task" button
    $('#taskForm').submit(handleAddTask);
});
