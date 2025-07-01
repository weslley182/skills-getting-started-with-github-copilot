document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Função para buscar e renderizar as atividades
  async function fetchAndRenderActivities() {
    const res = await fetch('/activities');
    const activities = await res.json();
    renderActivities(activities);
    // Atualiza o select do formulário de inscrição também, se necessário
    updateActivitySelect(activities);
  }

  // Atualiza o select do formulário de inscrição
  function updateActivitySelect(activities) {
    const select = document.getElementById('activity');
    if (!select) return;
    // Salva o valor selecionado
    const selected = select.value;
    // Limpa e repopula
    select.innerHTML = '<option value="">-- Select an activity --</option>';
    Object.keys(activities).forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      select.appendChild(option);
    });
    // Restaura seleção se possível
    if (selected) select.value = selected;
  }

  // Renderiza as atividades (incluindo participantes)
  function renderActivities(activities) {
    const activitiesList = document.getElementById('activities-list');
    activitiesList.innerHTML = '';
    Object.entries(activities).forEach(([name, activity]) => {
      const card = document.createElement('div');
      card.className = 'activity-card';

      // Título
      const title = document.createElement('h4');
      title.textContent = name;
      card.appendChild(title);

      // Descrição
      const desc = document.createElement('p');
      desc.textContent = activity.description;
      card.appendChild(desc);

      // Horário
      const sched = document.createElement('p');
      sched.innerHTML = `<strong>Schedule:</strong> ${activity.schedule}`;
      card.appendChild(sched);

      // Participantes
      const participantsSection = document.createElement('div');
      participantsSection.className = 'activity-card-participants';

      const participantsTitle = document.createElement('h5');
      participantsTitle.textContent = 'Participants';
      participantsSection.appendChild(participantsTitle);

      const participantsList = document.createElement('ul');
      if (activity.participants && activity.participants.length > 0) {
        activity.participants.forEach(email => {
          const li = document.createElement('li');
          li.textContent = email;
          participantsList.appendChild(li);
        });
      } else {
        const li = document.createElement('li');
        li.textContent = 'No participants yet';
        participantsList.appendChild(li);
      }
      participantsSection.appendChild(participantsList);

      card.appendChild(participantsSection);

      activitiesList.appendChild(card);
    });
  }

  // Lida com o envio do formulário de inscrição
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Atualiza a lista de atividades/participantes sem recarregar a página
        await fetchAndRenderActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Inicialização ao carregar a página
  window.addEventListener('DOMContentLoaded', fetchAndRenderActivities);
});
