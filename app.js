// 초기 데이터 - localStorage에서 불러오거나 기본값 설정
let reservations = JSON.parse(localStorage.getItem('meetingRoomReservations')) || [];

// DOM 요소들
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const reservationForm = document.getElementById('reservationForm');
const reservationList = document.getElementById('reservationList');
const myReservations = document.getElementById('myReservations');
const searchBtn = document.getElementById('searchBtn');
const searchReservationBtn = document.getElementById('searchReservationBtn');
const filterDate = document.getElementById('filterDate');
const searchName = document.getElementById('searchName');
const searchPassword = document.getElementById('searchPassword');

// 오늘 날짜로 기본값 설정
const today = new Date().toISOString().split('T')[0];
document.getElementById('date').min = today;
filterDate.value = today;

// 페이지 로드 시 예약 현황 표시
document.addEventListener('DOMContentLoaded', () => {
    displayReservations(today);
});

// 탭 전환 기능
function switchTab(e) {
    // 모든 탭 버튼과 콘텐츠에서 active 클래스 제거
    tabButtons.forEach(button => button.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // 클릭한 탭 활성화
    const tabId = this.getAttribute('data-tab');
    this.classList.add('active');
    document.getElementById(tabId).classList.add('active');
    
    // 예약 현황 탭으로 이동 시 자동으로 오늘 날짜 기준으로 조회
    if (tabId === 'list') {
        displayReservations(today);
    }
}

// 예약 추가 함수
function addReservation(room, date, time, name, password) {
    const id = Date.now().toString();
    const reservation = {
        id,
        room,
        date,
        time,
        name,
        password
    };
    
    // 중복 예약 확인
    const isDuplicate = reservations.some(res => 
        res.room === room && res.date === date && res.time === time
    );
    
    if (isDuplicate) {
        alert('이미 예약된 시간대입니다. 다른 시간을 선택해주세요.');
        return false;
    }
    
    reservations.push(reservation);
    saveReservations();
    return true;
}

// 예약 수정 함수
function updateReservation(id, updatedReservation) {
    const index = reservations.findIndex(res => res.id === id);
    if (index !== -1) {
        // 중복 예약 확인 (자기 자신 제외)
        const isDuplicate = reservations.some((res, i) => 
            i !== index &&
            res.room === updatedReservation.room && 
            res.date === updatedReservation.date && 
            res.time === updatedReservation.time
        );
        
        if (isDuplicate) {
            alert('이미 예약된 시간대입니다. 다른 시간을 선택해주세요.');
            return false;
        }
        
        reservations[index] = { ...reservations[index], ...updatedReservation };
        saveReservations();
        return true;
    }
    return false;
}

// 예약 삭제 함수
function deleteReservation(id) {
    const index = reservations.findIndex(res => res.id === id);
    if (index !== -1) {
        reservations.splice(index, 1);
        saveReservations();
        return true;
    }
    return false;
}

// localStorage에 저장
function saveReservations() {
    localStorage.setItem('meetingRoomReservations', JSON.stringify(reservations));
}

// 예약 목록 표시
function displayReservations(date) {
    const filtered = reservations.filter(res => res.date === date);
    
    if (filtered.length === 0) {
        reservationList.innerHTML = '<p>예약된 회의실이 없습니다.</p>';
        return;
    }
    
    // 회의실별로 그룹화
    const rooms = {
        'room1': '1번 회의실 (4인)',
        'room2': '2번 회의실 (6인)',
        'room3': '3번 회의실 (10인)',
        'room4': '대회의실 (20인)'
    };
    
    // 시간대 순으로 정렬
    filtered.sort((a, b) => a.time.localeCompare(b.time));
    
    let html = '<div class="reservation-list">';
    
    // 날짜 표시
    const dateObj = new Date(date);
    const formattedDate = `${dateObj.getFullYear()}년 ${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`;
    html += `<h3>${formattedDate} 예약 현황</h3>`;
    
    // 회의실별로 예약 정보 표시
    Object.entries(rooms).forEach(([roomId, roomName]) => {
        const roomReservations = filtered.filter(res => res.room === roomId);
        
        html += `<div class="room-reservations">`;
        html += `<h4>${roomName}</h4>`;
        
        if (roomReservations.length === 0) {
            html += '<p>예약이 없습니다.</p>';
        } else {
            roomReservations.forEach(res => {
                const timeText = res.time;
                html += `
                    <div class="reservation-item">
                        <div class="reservation-info">
                            <span>${timeText} - ${res.name} 님</span>
                        </div>
                    </div>
                `;
            });
        }
        
        html += `</div>`;
    });
    
    html += '</div>';
    reservationList.innerHTML = html;
}

// 내 예약 조회 및 표시
function searchMyReservations() {
    const name = searchName.value.trim();
    const password = searchPassword.value.trim();
    
    if (!name || !password) {
        alert('이름과 비밀번호를 모두 입력해주세요.');
        return;
    }
    
    const myReservationsList = reservations.filter(
        res => res.name === name && res.password === password
    );
    
    if (myReservationsList.length === 0) {
        myReservations.innerHTML = '<p>예약 내역이 없습니다.</p>';
        return;
    }
    
    // 날짜와 시간 순으로 정렬
    myReservationsList.sort((a, b) => {
        if (a.date === b.date) {
            return a.time.localeCompare(b.time);
        }
        return a.date.localeCompare(b.date);
    });
    
    let html = '<div class="my-reservations-list">';
    
    const rooms = {
        'room1': '1번 회의실 (4인)',
        'room2': '2번 회의실 (6인)',
        'room3': '3번 회의실 (10인)',
        'room4': '대회의실 (20인)'
    };
    
    myReservationsList.forEach(res => {
        const date = new Date(res.date);
        const formattedDate = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
        
        html += `
            <div class="reservation-item" data-id="${res.id}">
                <div class="reservation-info">
                    <div><strong>${formattedDate}</strong> ${res.time}</div>
                    <div>${rooms[res.room]}</div>
                </div>
                <div class="reservation-actions">
                    <button class="edit-btn" onclick="editReservation('${res.id}')">수정</button>
                    <button class="delete-btn" onclick="deleteMyReservation('${res.id}')">삭제</button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    myReservations.innerHTML = html;
}

// 내 예약 삭제
function deleteMyReservation(id) {
    if (!confirm('정말로 이 예약을 취소하시겠습니까?')) {
        return;
    }
    
    if (deleteReservation(id)) {
        alert('예약이 취소되었습니다.');
        searchMyReservations(); // 목록 갱신
    } else {
        alert('예약 취소에 실패했습니다.');
    }
}

// 예약 수정 폼 표시
function editReservation(id) {
    const reservation = reservations.find(res => res.id === id);
    if (!reservation) return;
    
    // 수정 폼 생성
    const form = document.createElement('div');
    form.className = 'edit-form';
    form.innerHTML = `
        <h4>예약 수정</h4>
        <div class="form-group">
            <label for="editRoom">회의실:</label>
            <select id="editRoom" required>
                <option value="room1" ${reservation.room === 'room1' ? 'selected' : ''}>1번 회의실 (4인)</option>
                <option value="room2" ${reservation.room === 'room2' ? 'selected' : ''}>2번 회의실 (6인)</option>
                <option value="room3" ${reservation.room === 'room3' ? 'selected' : ''}>3번 회의실 (10인)</option>
                <option value="room4" ${reservation.room === 'room4' ? 'selected' : ''}>대회의실 (20인)</option>
            </select>
        </div>
        <div class="form-group">
            <label for="editDate">날짜:</label>
            <input type="date" id="editDate" value="${reservation.date}" required>
        </div>
        <div class="form-group">
            <label for="editTime">시간:</label>
            <select id="editTime" required>
                <option value="09:00" ${reservation.time === '09:00' ? 'selected' : ''}>09:00 - 10:00</option>
                <option value="10:00" ${reservation.time === '10:00' ? 'selected' : ''}>10:00 - 11:00</option>
                <option value="11:00" ${reservation.time === '11:00' ? 'selected' : ''}>11:00 - 12:00</option>
                <option value="13:00" ${reservation.time === '13:00' ? 'selected' : ''}>13:00 - 14:00</option>
                <option value="14:00" ${reservation.time === '14:00' ? 'selected' : ''}>14:00 - 15:00</option>
                <option value="15:00" ${reservation.time === '15:00' ? 'selected' : ''}>15:00 - 16:00</option>
                <option value="16:00" ${reservation.time === '16:00' ? 'selected' : ''}>16:00 - 17:00</option>
            </select>
        </div>
        <div class="form-group">
            <label for="editPassword">비밀번호 확인:</label>
            <input type="password" id="editPassword" required>
        </div>
        <div class="form-actions">
            <button type="button" id="saveEditBtn">저장</button>
            <button type="button" id="cancelEditBtn">취소</button>
        </div>
    `;
    
    // 기존 내용 숨기고 폼 표시
    const container = document.querySelector(`.reservation-item[data-id="${id}"]`);
    container.innerHTML = '';
    container.appendChild(form);
    
    // 저장 버튼 이벤트 리스너
    document.getElementById('saveEditBtn').addEventListener('click', () => {
        const password = document.getElementById('editPassword').value;
        
        if (password !== reservation.password) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }
        
        const updatedReservation = {
            room: document.getElementById('editRoom').value,
            date: document.getElementById('editDate').value,
            time: document.getElementById('editTime').value
        };
        
        if (updateReservation(id, updatedReservation)) {
            alert('예약이 수정되었습니다.');
            searchMyReservations(); // 목록 갱신
        }
    });
    
    // 취소 버튼 이벤트 리스너
    document.getElementById('cancelEditBtn').addEventListener('click', () => {
        searchMyReservations(); // 원래 목록으로 돌아가기
    });
}

// 이벤트 리스너 등록
function initEventListeners() {
    // 탭 전환
    tabButtons.forEach(button => {
        button.addEventListener('click', switchTab);
    });
    
    // 예약 폼 제출
    reservationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const room = document.getElementById('room').value;
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        const name = document.getElementById('name').value.trim();
        const password = document.getElementById('password').value;
        
        if (!room || !date || !time || !name || !password) {
            alert('모든 필드를 입력해주세요.');
            return;
        }
        
        if (addReservation(room, date, time, name, password)) {
            alert('예약이 완료되었습니다.');
            this.reset();
            // 예약 현황 탭으로 이동
            document.querySelector('[data-tab="list"]').click();
            displayReservations(date);
        }
    });
    
    // 예약 검색 버튼
    searchBtn.addEventListener('click', () => {
        displayReservations(filterDate.value);
    });
    
    // 내 예약 조회 버튼
    searchReservationBtn.addEventListener('click', searchMyReservations);
    
    // 엔터 키로 조회 가능하도록
    searchName.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchMyReservations();
    });
    
    searchPassword.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchMyReservations();
    });
}

// 초기화
function init() {
    initEventListeners();
    
    // 오늘 날짜 기준으로 예약 목록 표시
    displayReservations(today);
}

// 전역 함수로 노출
window.editReservation = editReservation;
window.deleteMyReservation = deleteMyReservation;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', init);
