<script>
    // Sample data for four admit cards
    const admitCards = [
      {
        studentName: "John Doe",
      },
      {
        studentName: "Jane Smith",
      },
      {
        studentName: "Alice Johnson",
      },
      {
        studentName: "Bob Williams",
      },
      {
        studentName: "John Doe",
      },
      {
        studentName: "Jane Smith",
      },
      {
        studentName: "Alice Johnson",
      },
      {
        studentName: "Bob Williams",
      },{
        studentName: "John Doe",
      },
      {
        studentName: "Jane Smith",
      },
      {
        studentName: "Alice Johnson",
      },
      {
        studentName: "Bob Williams",
      },{
        studentName: "John Doe",
      },
      {
        studentName: "Jane Smith",
      },
      {
        studentName: "Alice Johnson",
      },
      {
        studentName: "Bob Williams",
      },{
        studentName: "John Doe",
      },
      {
        studentName: "Jane Smith",
      },
      {
        studentName: "Alice Johnson",
      },
      {
        studentName: "Bob Williams",
      },{
        studentName: "John Doe",
      },
      {
        studentName: "Jane Smith",
      },
      {
        studentName: "Alice Johnson",
      },
      {
        studentName: "Bob Williams",
      },{
        studentName: "John Doe",
      },
      {
        studentName: "Jane Smith",
      },
      {
        studentName: "Alice Johnson",
      },
      {
        studentName: "Bob Williams",
      },{
        studentName: "John Doe",
      },
      {
        studentName: "Jane Smith",
      },
      {
        studentName: "Alice Johnson",
      },
      {
        studentName: "Bob Williams",
      },{
        studentName: "John Doe",
      },
      {
        studentName: "Jane Smith",
      },
      {
        studentName: "Alice Johnson",
      },
      {
        studentName: "Bob Williams",
      },
    ];
    let count = 100;
  </script>
  
  <div class="a4-page">
    <div class="flex flex-col">
      <!-- {#each {length: 5} as _, i} -->
      <!-- {#each admitCards as card} -->
        <!-- <div class="admit-card bg-white  text-sm">
          <div class="bg-blue-400 text-white p-2 text-center mb-3 w-full flex justify-between">
            <div class="flex-1">
                <p>বৃত্তি রোল</p>
                <div class="border mx-16 font-bold bg-slate-400">123456</div>
            </div>
            <div class="flex-1">
                <h1 class="text-xl font-bold">কিশোরকণ্ঠ মেধাবৃত্তি - ২০২৪</h1>
                <p class="text-sm border-2 rounded-full">প্রবেশপত্র</p>
            </div>
            <div class="flex-1"></div>
          </div>
          
          <div class="w-full ">
            <div class="grid grid-cols-4">
              <div class="mb-2 col-span-2">
                <p class="text-gray-600">পরীক্ষার্থীর নাম</p>
                <p class="font-semibold">মুফাসসির আহমদ চৌধুরী</p>
              </div>
              <div class="mb-2">
                <p class="text-gray-600">পিতার নাম</p>
                <p class="font-semibold">হাফিজ মোঃ মাশহুদ চৌধুরী</p>
              </div>
              <div class="mb-2">
                <p class="text-gray-600">মোবাইল</p>
                <p class="font-semibold">01771144308</p>
              </div>
              <div class="mb-2 col-span-2">
                <p class="text-gray-600">প্রতিষ্ঠানের নাম</p>
                <p class="font-semibold">শাহজালাল বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়</p>
              </div>
              <div class="mb-2">
                <p class="text-gray-600">শ্রেণি</p>
                <p class="font-semibold">৪র্থ</p>
              </div>
              <div class="mb-2">
                <div class="w-1/2">
                    <label class="block text-sm font-medium text-gray-700"></label>
                    <div class="flex space-x-4">
                      <label class="inline-flex items-center">
                        <input type="radio" value="male" checked required class="form-radio">
                        <span class="ml-2">ছাত্র</span>
                      </label>
                      <label class="inline-flex items-center">
                        <input type="radio" value="female" required class="form-radio">
                        <span class="ml-2">ছাত্রী</span>
                      </label>
                    </div>
                  </div>
                  <div class="w-1/2">
                    <label class="block text-sm font-medium text-gray-700"></label>
                    <div class="flex space-x-4">
                      <label class="inline-flex items-center">
                        <input type="radio" value="male" checked required class="form-radio">
                        <span class="ml-2">স্কুল</span>
                      </label>
                      <label class="inline-flex items-center">
                        <input type="radio" value="female" required class="form-radio">
                        <span class="ml-2">মাদরাসা</span>
                      </label>
                    </div>
                  </div>
              </div>
            </div>
            
          </div>
          
          <div class="text-sm border-2 border-blue-400">
            <div class="text-lg font-semibold text-blue-400 flex justify-between">
                <div>
                    পরীক্ষার কেন্দ্রঃ 
                </div>
                <div>
                    শাহজালাল জামেয়া ইসলামিয়া কামিল মাদরাসা, পাঠানটুলা
                </div>
                <div></div>
            </div>
            <div class="w-full bg-blue-400 text-center text-white">
                পরীক্ষার সময়সূচী
            </div>
            <div class="grid grid-cols-3 text-xs divide-x-2 divide-blue-400 text-center ">
                <div>
                    ২ নভেম্বর, ২০২৪ <br> শনিবার
                </div>
                <div class="divide-y-2 divide-blue-400">
                    <div>
                        ৯:৩০-১০:৫০
                    </div>
                    <div>
                        বাংলা ও ইংরেজি
                    </div>
                </div>
                <div class="divide-y-2 divide-blue-400">
                    <div>
                        ১১:০০-১২:০০
                    </div>
                    <div>
                        গণিত ও সাধারণ জ্ঞান/সাধারণ বিজ্ঞান
                    </div>
                </div>
            </div>
          </div>
           -->
          <!-- <div class="mt-4 flex justify-between">
            <div class="text-center">
              <div class="w-40 h-10 border-b-2 border-gray-400"></div>
              <p class="mt-1">Student Signature</p>
            </div>
            <div class="text-center">
              <div class="w-40 h-10 border-b-2 border-gray-400"></div>
              <p class="mt-1">Authorized Signature</p>
            </div>
          </div> -->
        <!-- </div>
      {/each} -->
      <!-- {#each admitCards as card} -->
      {#each {length: 5} as _, i}
        <div class="admit-card bg-white  text-sm p-4">
        
          <div class="text-center text-lg">
            পরীক্ষা সংক্রান্ত নিয়মাবলী
          </div>
          <div>
            - প্রবেশপত্র ব্যতিত কোন পরীক্ষার্থী পরীক্ষায় অংশগ্রহণ করতে পারবে না। <br>
            - প্রবেশপত্র ব্যতিত কোন প্রকার কাগজপত্র পরীক্ষা কেন্দ্রে বহন করতে পারবে না। <br>
            - প্রত্যেক পরীক্ষার্থী প্রয়োজনীয় ক্যালকুলেটর, কলম ও জ্যামিতি বক্স অবশ্যই সাথে আনতে হবে। <br>
            - প্রবেশপত্রে উল্লেখিত সময়ের ১৫ মিনিট পূর্বে পরীক্ষার্থীকে অবশ্যই পরীক্ষার হলে উপস্থিত হতে হবে। <br>
            - প্রতিটি শ্রেণির সর্বমোট ২০০ নম্বরের পরীক্ষা হবে। বাংলা ৫০, গণিত ৫০, ইংরেজি ৫০ এবং সাধারণ জ্ঞান (৬ষ্ঠ-১০ম) / সাধারণ বিজ্ঞান (৪র্থ, ৫ম) ৫০ নম্বরের নৈর্ব্যক্তিক পরীক্ষা অনুষ্ঠিত হবে। <br>
          </div>
          <div class="mt-4 flex justify-between">
            <div class=" mx-4 border-2 border-blue-400 pt-2 px-8">
              <div>
                <div class="font-semibold">অফিস কর্তৃক পূরণীয়</div>
                <div>থানাঃ স্কুল বিভাগ</div>
                <div>সিরিয়ালঃ 20001</div>
              </div>
            </div>
            <div class="text-center relative">
              <img src="/sign.png" alt="" srcset="" class="left-4 h-20 w-30 absolute">
              <div class="w-40 h-10 border-b-2 border-gray-400 mt-8"></div>
              <p class="mt-1">পরিচালকের স্বাক্ষর</p>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
  
  <style>
    .a4-page {
      width: 210mm;
      min-height: 297mm;
      padding: 10mm;
      margin: 0 auto;
      background-color: white;
    }
  
    .admit-card {
      height: 74.25mm; /* Approximately 1/4 of A4 height minus some space for margins */
    }
  
    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      .a4-page {
        width: 210mm;
        min-height: 297mm;
        padding: 0;
        margin: 0;
      }
      @page {
        size: A4;
        margin: 0;
      }
    }
  
    /* Add any additional print-specific styles here */
  </style>