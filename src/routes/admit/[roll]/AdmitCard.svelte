<script>
  import { onMount } from 'svelte';
  import Papa from 'papaparse';
  import { page } from '$app/stores';

  let admitCardInfo = null;
  let loading = true;
  let error = null;

  const thana = {
      1: 'কোতোয়ালী পূর্ব',
      2: 'কোতোয়ালী পশ্চিম',
      3: 'শাহপরান পূর্ব',
      4: 'শাহপরান পশ্চিম',
      5: 'দক্ষিণ সুরমা পূর্ব',
      6: 'দক্ষিণ সুরমা পশ্চিম',
      7: 'বিমানবন্দর',
      8: 'বুরহান উদ্দিন',
      9: 'জালালাবাদ',
      10: 'এমসি কলেজ',
      11: 'মেডিকেল কলেজ',
      12: 'মদন মোহন কলেজ',
      13: 'সরকারি কলেজ',
      14: 'আলিয়া মাদরাসা',
      15: 'পাঠানটুলা জামেয়া',
      16: 'কৃষি বিশ্ববিদ্যালয়',
      17: 'প্রাইভেট বিশ্ববিদ্যালয়',
      18: 'প্রাইভেট মেডিকেল',
      19: 'কলেজ বিভাগ',
      20: 'স্কুল বিভাগ',
      21: 'মিরাবাজার',
      22: 'সিলেট পলিটেকনিক',
      23: 'দক্ষিণ সুরমা কলেজ',
      24: 'শিশুকল্যান',
      25: 'দিশারী',
      26: 'ইংলিশ মিডিয়াম',
      27: 'কোচিং',
      28: 'কওমি পরিষদ',
      31: 'পপি লাইব্রেরি',
      32: 'স্বাধীনতা লাইব্রেরি',
      33: 'ফ্রেন্ডস লাইব্রেরি',
      34: 'প্রভিন্সিয়াল লাইব্রেরি',
      41: 'নিউক্লিয়াস (মদিনা মার্কেট)',
      42: 'নিউক্লিয়াস (লামাবাজার)',
      43: 'নিউক্লিয়াস (শিবগঞ্জ)',
      99: 'অনলাইন',
  };

  onMount(async () => {
    try {
      const csvResponse = await fetch('/Roll.csv');
      if (!csvResponse.ok) throw new Error('Failed to load data');
      const csvText = await csvResponse.text();
      
      Papa.parse(csvText, {
        header: true,
        complete: (result) => {
          const roll = $page.params.roll;
          const mobile = $page.url.searchParams.get("challenge");
          admitCardInfo = result.data.find(card => card.Roll == roll && card.Mobile == mobile);
          if (!admitCardInfo) {
            error = "Admit card not found. Please check your roll and mobile number.";
          }
          loading = false;
        },
        error: (err) => {
          console.error('Error parsing CSV:', err);
          error = "There was a problem loading the admit card data.";
          loading = false;
        }
      });
    } catch (err) {
      console.error('Error fetching CSV:', err);
      error = "Could not connect to the server to get admit card information.";
      loading = false;
    }
  });
</script>

<div class="print:hidden w-full flex justify-center my-8">
  <button class="bg-primary-600 text-white py-3 px-8 rounded-full hover:bg-primary-700 transition-transform transform hover:scale-105 text-lg font-semibold shadow-lg" on:click={() => window.print()}>
    প্রিন্ট বা ডাউনলোড করুন
  </button>
</div>
<p class="text-center text-gray-500 print:hidden mb-8">*প্রিন্ট করার সময় ব্যাকগ্রাউন্ড গ্রাফিক্স অপশনটি চালু রাখুন।</p>

{#if loading}
  <div class="text-center p-12">
    <p class="text-lg text-primary-700">লোড হচ্ছে...</p>
  </div>
{:else if error}
  <div class="text-center p-12 bg-red-50 border-l-4 border-red-400">
    <p class="text-lg text-red-700">{error}</p>
    <p class="mt-4">অনুগ্রহ করে সঠিক তথ্য দিয়ে আবার চেষ্টা করুন অথবা আমাদের সাথে যোগাযোগ করুন।</p>
  </div>
{:else if admitCardInfo}
  <div class="a4-page-container">
    <div class="a4-page">
      <!-- Admit Card 1 -->
      <div class="admit-card-wrapper">
        <div class="admit-card-header">
          <div class="roll-number">
            <p>বৃত্তি রোল</p>
            <div class="roll-box">{admitCardInfo.Roll}</div>
          </div>
          <div class="header-title">
            <h1 class="text-2xl font-bold">কিশোরকণ্ঠ মেধাবৃত্তি - ২০২৪</h1>
            <p class="admit-badge">প্রবেশপত্র</p>
          </div>
          <div class="logo-placeholder">
            <img src="/favicon.png" alt="Logo" class="h-16 w-16">
          </div>
        </div>
        <div class="student-info">
            <div class="info-grid">
                <div class="info-item col-span-2"><span class="info-label">পরীক্ষার্থীর নাম:</span> {admitCardInfo.Name}</div>
                <div class="info-item"><span class="info-label">পিতার নাম:</span> {admitCardInfo["Father's name"]}</div>
                <div class="info-item"><span class="info-label">মোবাইল:</span> 0{admitCardInfo.Mobile}</div>
                <div class="info-item col-span-2"><span class="info-label">প্রতিষ্ঠানের নাম:</span> {admitCardInfo.Institute}</div>
                <div class="info-item"><span class="info-label">শ্রেণি:</span> {admitCardInfo.Class}</div>
                <div class="info-item flex items-center space-x-4">
                    <span class="info-label">লিঙ্গ:</span>
                    <label><input type="radio" checked={admitCardInfo.Gender === 'male'} disabled> ছাত্র</label>
                    <label><input type="radio" checked={admitCardInfo.Gender === 'female'} disabled> ছাত্রী</label>
                </div>
            </div>
        </div>
        <div class="exam-center">
          পরীক্ষার কেন্দ্রঃ <span class="font-bold">{admitCardInfo.Center}</span>
        </div>
        <div class="exam-schedule">
          <div class="schedule-header">পরীক্ষার সময়সূচী</div>
          <div class="schedule-grid">
            <div class="schedule-item font-bold">২ নভেম্বর, ২০২৪ <br> শনিবার</div>
            <div class="schedule-item">
              <div>৯:৩০ - ১০:৫০</div>
              <div>বাংলা ও ইংরেজি</div>
            </div>
            <div class="schedule-item">
              <div>১১:০০ - ১২:০০</div>
              <div>গণিত ও সাধারণ জ্ঞান/বিজ্ঞান</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Instructions Card -->
      <div class="admit-card-wrapper instructions-card">
        <div class="instructions-content">
            <h2 class="text-xl font-bold text-center mb-4">পরীক্ষা সংক্রান্ত নিয়মাবলী</h2>
            <ul class="list-disc list-inside space-y-2 text-sm">
                <li>প্রবেশপত্র ব্যতিত কোন পরীক্ষার্থী পরীক্ষায় অংশগ্রহণ করতে পারবে না।</li>
                <li>প্রত্যেক পরীক্ষার্থী প্রয়োজনীয় ক্যালকুলেটর, কলম ও জ্যামিতি বক্স অবশ্যই সাথে আনতে হবে।</li>
                <li>পরীক্ষার হলে মোবাইল ফোন ও ইলেকট্রনিক ডিভাইস আনা সম্পূর্ণ নিষিদ্ধ।</li>
                <li>পরীক্ষা শুরুর ১৫ মিনিট পূর্বে আসন গ্রহণ করতে হবে।</li>
                <li>উত্তরপত্রে রোল নম্বর ও অন্যান্য তথ্য সঠিকভাবে পূরণ করতে হবে।</li>
            </ul>
        </div>
        <div class="address-section">
            <span class="font-bold">ঠিকানাঃ</span> {admitCardInfo['Present Address']}
        </div>
        <div class="footer-section">
            <div class="office-use">
                <p class="font-bold">অফিস কর্তৃক পূরণীয়</p>
                <p>থানাঃ {thana[admitCardInfo.Branch]}</p>
                <p>সিরিয়ালঃ {admitCardInfo.Serial}</p>
            </div>
            <div class="signature-area">
                <img src="/sign.png" alt="Director's Signature" class="signature-img">
                <p class="signature-line"></p>
                <p>পরিচালকের স্বাক্ষর</p>
            </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .a4-page-container {
    display: flex;
    justify-content: center;
    background-color: #f3f4f6;
    padding: 2rem 0;
  }
  .a4-page {
    width: 210mm;
    min-height: 297mm;
    padding: 10mm;
    margin: 0 auto;
    background-color: white;
    box-shadow: 0 0 15px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }
  .admit-card-wrapper {
    border: 2px solid #2f8a67;
    border-radius: 1rem;
    overflow: hidden;
    font-family: 'SolaimanLipi', sans-serif;
    height: 138mm;
    display: flex;
    flex-direction: column;
  }
  .admit-card-header {
    background-color: #d9f2e6;
    padding: 0.75rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #2f8a67;
  }
  .roll-number {
    text-align: center;
  }
  .roll-box {
    border: 2px solid #2f8a67;
    background-color: white;
    font-weight: bold;
    font-size: 1.5rem;
    padding: 0.25rem 1rem;
    border-radius: 0.5rem;
    margin-top: 0.25rem;
  }
  .header-title {
    text-align: center;
    color: #266c52;
  }
  .admit-badge {
    border: 2px solid #266c52;
    border-radius: 9999px;
    padding: 0.25rem 1rem;
    margin-top: 0.25rem;
    display: inline-block;
  }
  .student-info {
    padding: 1rem;
    flex-grow: 1;
  }
  .info-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
  }
  .info-item {
      font-size: 0.9rem;
  }
  .info-label {
      font-weight: 600;
      color: #266c52;
  }
  .exam-center {
    text-align: center;
    padding: 0.75rem;
    font-size: 1.25rem;
    background-color: #d9f2e6;
    color: #266c52;
    border-top: 2px solid #2f8a67;
    border-bottom: 2px solid #2f8a67;
  }
  .exam-schedule {
    text-align: center;
  }
  .schedule-header {
    background-color: #2f8a67;
    color: white;
    padding: 0.5rem;
    font-size: 1.1rem;
    font-weight: bold;
  }
  .schedule-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    color: #266c52;
  }
  .schedule-item {
    padding: 0.5rem;
    border-left: 2px solid #2f8a67;
  }
  .schedule-item:first-child {
      border-left: none;
  }
  .schedule-item > div:first-child {
      font-weight: bold;
      border-bottom: 1px solid #b7e6d0;
      margin-bottom: 0.25rem;
      padding-bottom: 0.25rem;
  }

  .instructions-card {
      background-color: #effaf5;
      padding: 1rem;
      justify-content: space-between;
  }
  .address-section {
      padding: 0.5rem;
      border-top: 1px dashed #2f8a67;
      border-bottom: 1px dashed #2f8a67;
      margin: 1rem 0;
  }
  .footer-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
  }
  .office-use {
      border: 2px solid #2f8a67;
      padding: 0.5rem;
      border-radius: 0.5rem;
  }
  .signature-area {
      text-align: center;
      position: relative;
  }
  .signature-img {
      position: absolute;
      bottom: 2rem; 
      left: 50%;
      transform: translateX(-50%);
      height: 4rem;
      opacity: 0.8;
  }
  .signature-line {
      border-bottom: 2px dotted #266c52;
      width: 12rem;
      margin-top: 3rem;
  }

  @media print {
    .a4-page-container { padding: 0; background-color: white; }
    .a4-page { box-shadow: none; }
    @page {
      size: A4;
      margin: 0;
    }
  }
</style>