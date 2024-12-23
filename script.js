class Tasks {
  /**
   * Retrieves the tasks stored in the local storage.
   * @returns {Object[]} An array of task objects.
   */
  static #getTasks() {
    return JSON.parse(localStorage.getItem("tasks")) || [];
  }
  /**
   * Updates a task with the given ID, setting its name, description, and finished status.
   * @param {string} id - The ID of the task to update.
   * @param {string} name - The new name for the task.
   * @param {string} description - The new description for the task.
   * @param {boolean} finished - The new finished status for the task.
   */
  static #updateTask(id, name, description, finished) {
    const tasks = this.#getTasks();
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].id === id) {
        tasks[i].name = name;
        tasks[i].description = description;
        tasks[i].finished = finished;
        break;
      }
    }
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
  /**
   * Retrieves a task object by its ID from the list of tasks.
   * @param {string} id - The ID of the task to retrieve.
   * @returns {Object} The task object with the specified ID, or undefined if not found.
   */
  static #getTaskById(id) {
    return this.#getTasks().find((task) => task.id === id);
  }
  /**
   * Retrieves the list of unfinished tasks.
   * @returns {Object[]} An array of task objects that have not been marked as finished.
   */
  static getUnfinishedTasks() {
    return this.#getTasks().filter((task) => !task.finished);
  }
  /**
   * Retrieves the list of finished tasks.
   * @returns {Object[]} An array of task objects that have been marked as finished.
   */
  static getFinishedTasks() {
    return this.#getTasks().filter((task) => task.finished);
  }
  /**
   * Edits a task with the given ID, updating its name and description, and marking it as unfinished.
   * After updating the task, it clears the current rendering and re-renders the task list.
   * @param {string} id - The ID of the task to edit.
   * @param {string} name - The new name for the task.
   * @param {string} description - The new description for the task.
   */
  static #editTask(id, name, description) {
    this.#updateTask(id, name, description, false);

    this.clearRender();
    this.render();
  }
  /**
   * Renders an edit form for a task with the specified ID.
   * The form is rendered inside the corresponding todo list item element.
   * When the form is submitted, the #editTask method is called with the updated name and description.
   * @param {string} id - The ID of the task to edit.
   */
  static renderEditForm(id) {
    const task = this.#getTaskById(id);
    //Clear the block
    document.querySelector(`#todo li[data-id="${id}"]`).innerHTML = ``;
    //Render the form
    const form = document.createElement("form");
    form.onsubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const name = formData.get("name");
      const description = formData.get("description");
      this.#editTask(id, name, description);
    };
    form.dataset.id = id;
    form.innerHTML = `
        <input
            type="text"
            placeholder="write a todo"
            name="name"
            required
            minlength="3"
            value='${task.name}'
          />
          <textarea
            name="description"
            id="description"
            placeholder="give a description"
            value=
          >${task.description}</textarea>
    <button>save</button>
    `;
    document.querySelector(`#todo li[data-id="${id}"]`).appendChild(form);
  }
  /**
   * Creates a new task with the given name and description, and adds it to the task list.
   * The task is assigned a unique ID based on the current timestamp, and is marked as unfinished.
   * The updated task list is then saved to local storage and the task list is re-rendered.
   * @param {string} name - The name of the new task.
   * @param {string} description - The description of the new task.
   */
  static createNew(name, description) {
    const id = String(Date.now());
    const tasks = this.#getTasks();
    tasks.push({ id, name, description, finished: false });
    localStorage.setItem("tasks", JSON.stringify(tasks));
    this.render();
  }
  /**
   * Marks a task as finished by updating its state in the task list and re-rendering the task list.
   * @param {string} id - The ID of the task to mark as finished.
   */
  static markAsFinished(id) {
    const task = this.#getTaskById(id);
    this.#updateTask(id, task.name, task.description, true);

    this.clearRender();
    this.render();
  }
  /**
   * Brings a task back to the unfinished state by updating its status in the task list and re-rendering the task list.
   * @param {string} id - The ID of the task to bring back.
   */
  static #bringTaskBack(id) {
    const task = this.#getTaskById(id);
    this.#updateTask(id, task.name, task.description, false);
    this.clearRender();
    this.render();
  }
  /**
   * Adds event listeners for the "finish", "remove", and "edit" actions on the task list.
   * This method is responsible for wiring up the user interface interactions for the task list.
   */
  static #addActions() {
    this.#addFinishAction();
    this.#addRemoveAction();
    this.#addEditAction();
    this.#addBackAction();
  }
  /**
   * Adds event listeners to the "finish" buttons on the task list, so that when a button is clicked,
   * the corresponding task is marked as finished.
   */
  static #addFinishAction() {
    document.querySelectorAll(".finish").forEach((button) => {
      button.addEventListener("click", () => {
        Tasks.markAsFinished(button.dataset.id);
      });
    });
  }
  /**
   * Adds event listeners to the "remove" buttons on the task list, so that when a button is clicked,
   * the corresponding task is removed from the task list.
   */
  static #addRemoveAction() {
    document.querySelectorAll(".remove").forEach((button) => {
      button.addEventListener("click", () => {
        Tasks.#removeTask(button.dataset.id);
      });
    });
  }
  /**
   * Adds event listeners to the "edit" buttons on the task list, so that when a button is clicked,
   * the corresponding task's edit form is rendered.
   */
  static #addEditAction() {
    document.querySelectorAll(".edit").forEach((button) => {
      button.addEventListener("click", () => {
        Tasks.renderEditForm(button.dataset.id);
      });
    });
  }
  static #addBackAction() {
    document.querySelectorAll(".back").forEach((button) => {
      button.addEventListener("click", () => {
        Tasks.#bringTaskBack(button.dataset.id);
      });
    });
  }
  /**
   * Removes a task from the task list by its ID.
   * This method filters the list of tasks to exclude the task with the given ID,
   * updates the tasks in localStorage, and then clears and re-renders the task list.
   * @param {string} id - The ID of the task to remove.
   */
  static #removeTask(id) {
    const tasks = this.#getTasks();
    const newTasks = tasks.filter((task) => task.id !== id);
    localStorage.setItem("tasks", JSON.stringify(newTasks));
    this.clearRender();
    this.render();
  }
  /**
   * Clears the rendered task lists by setting the inner HTML of the "todo" and "finished" elements to empty strings.
   * This method is used to reset the task list display before re-rendering the tasks.
   */
  static clearRender() {
    document.querySelector("#todo").innerHTML = ``;
    document.querySelector("#finished").innerHTML = "";
  }
  /**
   * Renders the task list by displaying both unfinished and finished tasks.
   * This method retrieves the unfinished and finished tasks, and then calls the `#renderItem` method
   * to create the HTML elements for each task and append them to the corresponding task list.
   * Finally, it calls the `#addActions` method to add event listeners to the task buttons.
   */
  static render() {
    //render todo
    const unfinishedTasks = this.getUnfinishedTasks();
    const finishedTasks = this.getFinishedTasks();
    unfinishedTasks.forEach((task) => {
      this.#renderItem("todo", task.id, task.name, task.description);
    });
    finishedTasks.forEach((task) => {
      this.#renderItem("finished", task.id, task.name, task.description);
    });
    this.#addActions();
  }
  /**
   * Renders a block of buttons for a task item, including "finish", "edit", and "delete" buttons.
   * The buttons are created and styled based on the task's type ("todo" or "finished").
   * @param {string} type - The type of the task ("todo" or "finished").
   * @param {string} id - The ID of the task.
   * @returns {HTMLDivElement} - A div element containing the rendered buttons.
   */
  static #renderButtonElement(type, id) {
    const buttonBlock = document.createElement("div");
    const buttons = [];
    if (type === "todo") {
      const finishButton = document.createElement("button");
      finishButton.innerText = "finish";
      finishButton.className = "finish";
      finishButton.dataset.id = id;
      finishButton.style.backgroundColor = "green";
      const editButton = document.createElement("button");
      editButton.innerText = "edit";
      editButton.className = "edit";
      editButton.dataset.id = id;
      buttons.push(finishButton, editButton);
    }
    if (type === "finished") {
      const editButton = document.createElement("button");
      editButton.innerText = "bring back";
      editButton.className = "back";
      editButton.dataset.id = id;
      buttons.push(editButton);
    }

    const deleteButton = document.createElement("button");
    deleteButton.innerText = "delete";
    deleteButton.className = "remove";
    deleteButton.style.backgroundColor = "red";
    deleteButton.dataset.id = id;
    buttons.push(deleteButton);
    //appending buttons to buttonBlock
    buttonBlock.append(...buttons);
    return buttonBlock;
  }
  /**
   * Renders a task item in the task list, including the task name, description, and a block of buttons.
   * The buttons are created and styled based on the task's type ("todo" or "finished").
   * @param {string} type - The type of the task ("todo" or "finished").
   * @param {string} id - The ID of the task.
   * @param {string} name - The name of the task.
   * @param {string} description - The description of the task.
   */
  static #renderItem(type, id, name, description) {
    const buttonBlock = this.#renderButtonElement(type, id);
    const li = document.createElement("li");
    li.dataset.id = id;
    const h4 = document.createElement("h4");
    h4.innerText = name;
    const p = document.createElement("p");
    p.innerText = description;
    li.append(h4, p, buttonBlock);
    document.querySelector(`#${type}`).append(li);
  }
}

document.querySelector("form").addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  Tasks.createNew(data.name, data.description);
  document.querySelector("form").reset();
});

document.addEventListener("DOMContentLoaded", () => {
  Tasks.render();
});
