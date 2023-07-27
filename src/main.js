const apiUrlLists = "http://localhost:3000/lists";
const apiUrlTasks = "http://localhost:3000/tasks";
const selectList = $("#select-list");

function fetchLists() {
  return $.ajax({
    url: apiUrlLists,
    method: "GET",
    dataType: "json",
  });
}

function fetchTasks() {
  return $.ajax({
    url: apiUrlTasks,
    method: "GET",
    dataType: "json",
  });
}

function addTask(taskName, listId) {
  return $.ajax({
    url: apiUrlTasks,
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({ title: taskName, listId: listId, completed: false }),
    dataType: "json",
  });
}

function markTaskAsCompleted(taskId) {
  const url = `${apiUrlTasks}/${taskId}`;
  return $.ajax({
    url: url,
    method: "PATCH",
    contentType: "application/json",
    data: JSON.stringify({ completed: true }),
    dataType: "json",
  });
}

function deleteTask(taskId) {
  const url = `${apiUrlTasks}/${taskId}`;
  return $.ajax({
    url: url,
    method: "DELETE",
  });
}

function populateLists(lists) {
  lists.forEach((list) => {
    const optionElement = $("<option>", {
      value: list.id,
      text: list.title,
    });

    selectList.append(optionElement);
  });

  selectList.on("change", () => {
    const selectedListId = parseInt($("#select-list").val(), 10);
    const selectedListTitle = selectList.find(":selected").text();

    fetchTasks().then((tasks) => {
      const filteredTasks = tasks.filter(
        (task) => task.listId === selectedListId
      );
      populateTaskList(filteredTasks);
    });
  });
}

function populateTaskList(tasks) {
  const taskList = $("#taskList");

  taskList.empty();

  tasks.forEach((task) => {
    const listItem = $("<li>", {
      class:
        "list-group-item d-flex justify-content-between align-items-center",
      text: task.title,
    });

    const actionsDiv = $("<div>", {
      class: "d-flex align-items-center gap-2",
    }).appendTo(listItem);

    const excludeBtn = $("<button>", {
      class: "btn btn-danger btn-sm ml-2",
      text: "Excluir",
    }).appendTo(actionsDiv);

    excludeBtn.on("click", () => {
      deleteTask(task.id).then(() => {
        listItem.remove();
      });
    });

    const markCompletedBtn = $("<button>", {
      class: "btn btn-success btn-sm ml-2 markCompletedBtn",
      text: "Concluída",
    }).appendTo(actionsDiv);

    if (task.completed) {
      listItem.addClass("list-group-item-success");
      markCompletedBtn.remove();
      excludeBtn.remove();
    }

    markCompletedBtn.on("click", () => {
      markTaskAsCompleted(task.id).then(() => {
        listItem.addClass("list-group-item-success");
        markCompletedBtn.remove();
        excludeBtn.remove();
      });
    });

    taskList.append(listItem);
  });
}

function handleAddTask() {
  const taskInput = $("#taskInput");
  const taskName = taskInput.val().trim();
  const selectedListId = parseInt($("#select-list").val(), 10);
  const selectedListTitle = selectList.find(":selected").text();

  if (taskName === "" || isNaN(selectedListId)) return;

  addTask(taskName, selectedListId).then(() => {
    taskInput.val("");
    fetchTasks().then((tasks) => {
      const filteredTasks = tasks.filter(
        (task) => task.listId === selectedListId
      );
      populateTaskList(filteredTasks);
    });
  });
}

function initApp() {
  let selectedListTitle;

  const taskInput = $("#taskInput");
  const addButton = $("#addButton");

  taskInput.on("input", () => {
    taskName = taskInput.val().trim();

    if (taskName === "") {
      addButton.prop("disabled", true);
    } else {
      addButton.prop("disabled", false);
    }
  });

  fetchLists()
    .then((lists) => {
      populateLists(lists);
      const selectedListId = parseInt($("#select-list").val(), 10);
      const selectedList = lists.find((list) => list.id === selectedListId);
      if (selectedList) {
        selectedListTitle = selectedList.title;
      }
    })
    .then(fetchTasks)
    .then((tasks) => {
      const selectedListId = parseInt($("#select-list").val(), 10);
      const filteredTasks = tasks.filter(
        (task) => task.listId === selectedListId
      );
      populateTaskList(filteredTasks);
    });

  $("#addButton").on("click", handleAddTask);
}

initApp();
