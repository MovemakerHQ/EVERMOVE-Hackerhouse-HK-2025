import React from "react";

const VisionPage = () => {
  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen p-4">
      {/* 顶部标题区域 */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-5xl font-bold text-center mb-14">我们的愿景</h1>
        <div className="flex justify-center">
          <img className="w-[951px] " src={"/visionzh.png"} />
        </div>
        <div className="divider"></div>
      </div>

      <div className="container mx-auto px-4 ">
        <div className="flex justify-center">
          <img className="w-[1000px] " src={"/des1zh.png"} />
        </div>
        <div className="flex justify-center">
          <img className="w-[1000px] " src={"/des2zh.png"} />
        </div>
        <div className="flex justify-center">
          <img className="w-[1000px] " src={"/des3zh.png"} />
        </div>
        <div className="divider"></div>
      </div>

      {/* 底部成员介绍区域 */}
      <div className="container mx-auto px-4 mt-16">
        <h2 className="text-5xl font-bold text-center mb-8">成员介绍</h2>
        {/*<div className="grid grid-cols-1 md:grid-cols-3 gap-4">*/}
        {/*  /!* 成员卡片 *!/*/}
        {/*  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">*/}
        {/*    <div className="flex justify-center">*/}
        {/*      <img className="w-[400px] " src={"/ferfizh.png"} />*/}
        {/*    </div>*/}
        {/*  </div>*/}

        {/*  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">*/}
        {/*    <div className="flex justify-center">*/}
        {/*      <img className="w-[400px] " src={"/eliozh.png"} />*/}
        {/*    </div>*/}
        {/*  </div>*/}

        {/*  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">*/}
        {/*    <div className="flex justify-center">*/}
        {/*      <img className="w-[400px] " src={"/bernardzh.png"} />*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*</div>*/}
        <div className="flex justify-center">
          <img className="w-[1320px] " src={"/peoplezh.png"}/>
        </div>
      </div>
    </div>
  );
};

export default VisionPage;
