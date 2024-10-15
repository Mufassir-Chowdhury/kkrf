<script>
    export let studentName = "John Doe";
    export let examName = "Final Examination";
    export let examDate = "2024-05-15";
    export let examTime = "09:00 AM";
    export let examVenue = "Main Hall, Building A";
    export let rollNumber = "2024001";
    export let photoUrl = "/api/placeholder/150/200";  // Placeholder for student photo
  </script>
  
  <div class="min-h-screen bg-gray-100 p-6 flex flex-col justify-center items-center">
    <div class="bg-white border-2 border-gray-300 rounded-lg shadow-lg w-full max-w-2xl overflow-hidden">
      <!-- Header -->
      <div class="bg-blue-600 text-white p-4 text-center">
        <h1 class="text-2xl font-bold">EXAM ADMIT CARD</h1>
        <p class="text-sm">{examName}</p>
      </div>
      
      <!-- Card Content -->
      <div class="p-6">
        <div class="flex">
          <!-- Left column: Student details -->
          <div class="flex-grow">
            <div class="mb-4">
              <p class="text-sm text-gray-600">Student Name</p>
              <p class="font-semibold">{studentName}</p>
            </div>
            <div class="mb-4">
              <p class="text-sm text-gray-600">Roll Number</p>
              <p class="font-semibold">{rollNumber}</p>
            </div>
            <div class="mb-4">
              <p class="text-sm text-gray-600">Exam Date</p>
              <p class="font-semibold">{examDate}</p>
            </div>
            <div class="mb-4">
              <p class="text-sm text-gray-600">Exam Time</p>
              <p class="font-semibold">{examTime}</p>
            </div>
            <div class="mb-4">
              <p class="text-sm text-gray-600">Exam Venue</p>
              <p class="font-semibold">{examVenue}</p>
            </div>
          </div>
          
          <!-- Right column: Photo -->
          <div class="ml-6">
            <div class="w-32 h-40 border-2 border-gray-300 overflow-hidden">
              <img src={photoUrl} alt="Student Photo" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>
        
        <!-- Instructions -->
        <div class="mt-6 text-sm text-gray-600">
          <h2 class="font-bold mb-2">Instructions:</h2>
          <ul class="list-disc list-inside">
            <li>Bring this admit card to the examination hall.</li>
            <li>Arrive at least 30 minutes before the exam start time.</li>
            <li>Bring a valid photo ID for verification.</li>
          </ul>
        </div>
        
        <!-- Signature fields -->
        <div class="mt-6 flex justify-between">
          <div class="text-center">
            <div class="w-40 h-16 border-b border-gray-400 mb-2"></div>
            <p class="text-sm">Student Signature</p>
          </div>
          <div class="text-center">
            <div class="w-40 h-16 border-b border-gray-400 mb-2"></div>
            <p class="text-sm">Authorized Signature</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <style>
    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
      .min-h-screen {
        min-height: 0 !important;
      }
      .bg-gray-100 {
        background-color: white !important;
      }
    }
  </style>