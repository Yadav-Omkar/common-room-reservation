import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// import { Calendar } from 'primereact/calendar';
// import "primereact/resources/themes/lara-dark-purple/theme.css";

const supabase = createClient('https://jsimrbgdhmaapvuobeoc.supabase.co', 'sb_publishable_3Fg_xId0qSlafIc-wvvZOg_Q8rtR4K4');

// form code here
const form = document.getElementById('reservationForm');

form.addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const date = document.getElementById('date').value;
    const timeFrom = document.getElementById('timeFrom').value;
    const timeTill = document.getElementById('timeTill').value;

    // input validation
    if (!username || username === null){
        alert("username missing :(");
        return;
    }

    if (!date || date === null){
        alert("date missing :(");
        return;
    }

    if (timeFrom >= timeTill){
        alert("enter a meaningful time difference");
        return;
    }

    console.log(username, date, timeFrom, timeTill);

    // insert is the 'PUT' command to upload a record to superbase
    const { error } = await supabase
        .from('reservations')
        .insert({name: username, date: date, time_from: timeFrom, time_till: timeTill})

    if (error){
        console.log(error.message);
    } else {
        loadReservations();
    }
});

// code for fetching the database and populating the list here
async function loadReservations() {
    const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('date', { ascending: true });

    if (error) {
        console.log(error.message);
        return;
    }

    renderReservations(data);
}

function renderReservations(reservations) {
    const list = document.getElementById('reservationList');
    list.innerHTML = '';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const formatTime = (t) => (t ? t.slice(0, 5) : "—");

    reservations
        .filter(res => {
            const resDate = new Date(res.date);
            resDate.setHours(0, 0, 0, 0);
            return resDate >= today;
        })
        .forEach(res => {
            const li = document.createElement('li');

            const formattedDate = formatDateInWords(res.date);

            const text = document.createElement('span');
            text.textContent = `${formattedDate}: ${formatTime(res.time_from)} - ${formatTime(res.time_till)} by ${res.name}`;

            const btn = document.createElement('button');
            btn.textContent = 'x';
            btn.style.marginLeft = '10px';

            btn.addEventListener('click', async () => {
                if (!confirm('Delete this reservation?')) return;
                await deleteReservation(res.id);
            });

            li.appendChild(text);
            li.appendChild(btn);

            list.appendChild(li);
        });
}

async function deleteReservation(id) {

    const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id);

    if (error) {
        console.log(error.message);
    } else {
        loadReservations();
    }
}

loadReservations();

// this convers YYYY:MM:DD to a format like "Monday, 4 May"
function formatDateInWords(dateString) {
    const date = new Date(dateString);

    return new Intl.DateTimeFormat('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    }).format(date);
}

