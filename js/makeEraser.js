function makeEraser(obj) {
    let colorSoPink = [181/255, 94/255, 129/255];
    let colorRatherPink = [117/255, 55/255, 66/255];
    let colorNotPink = [79/255, 55/255, 63/255];
    let colorSeemsBlack = [23/255, 19/255, 22/255];

    obj.vertices = [
        -0.320000, 0.661920, 0.096621, 255, 78, 118, 
        -0.295790, 0.746555, 0.138902, 255, 78, 118, 
        -0.320000, 0.807220, 0.096621, 255, 78, 118, 
        0.262400, 0.807220, 0.096621, 255, 78, 118, 
        0.295951, 0.746555, 0.138902, 255, 78, 118, 
        0.320000, 0.807220, 0.096621, 255, 78, 118, 
        0.320000, -0.645776, 0.096621, 255, 78, 118, 
        0.295951, -0.746149, 0.138902, 255, 78, 118, 
        0.320000, -0.807220, 0.096621, 255, 78, 118, 
        -0.256000, -0.807220, 0.096621, 255, 78, 118, 
        -0.295790, -0.746149, 0.138902, 255, 78, 118, 
        -0.320000, -0.807220, 0.096621, 255, 78, 118, 
        -0.256000, -0.807220, -0.138902, 255, 78, 118, 
        -0.312263, -0.787702, -0.216586, 64, 20, 30, 
        -0.256000, -0.807220, -0.221167, 64, 20, 30, 
        -0.256000, -0.645776, 0.138902, 255, 78, 118, 
        -0.236616, -0.746149, 0.138902, 255, 78, 118, 
        0.262400, -0.645776, -0.221167, 89, 28, 42, 
        0.312263, -0.787702, -0.216586, 64, 20, 30, 
        0.262400, -0.807220, -0.221167, 64, 20, 30, 
        0.262400, 0.807220, -0.138902, 210, 64, 97, 
        0.312263, 0.787702, -0.216586, 64, 20, 30, 
        0.262400, 0.807220, -0.221167, 64, 20, 30, 
        -0.320000, 0.661920, -0.138902, 255, 78, 118, 
        -0.312263, 0.787702, -0.216586, 64, 20, 30, 
        -0.320000, 0.661920, -0.221167, 65, 20, 30, 
        0.320000, -0.645776, -0.138902, 250, 76, 116, 
        0.320000, -0.645776, -0.221167, 65, 21, 31, 
        0.320000, 0.661920, -0.221167, 64, 20, 30, 
        0.320000, 0.661920, -0.138902, 165, 50, 77, 
        -0.320000, -0.645776, -0.138902, 255, 78, 118, 
        -0.320000, -0.807220, -0.138902, 255, 78, 118, 
        0.262400, -0.645776, -0.221167, 165, 50, 77, 
        0.262400, 0.661920, -0.221167, 70, 22, 33, 
        -0.295790, 0.661663, 0.138902, 255, 78, 118, 
        -0.256000, 0.661920, 0.138902, 255, 78, 118, 
        0.295951, 0.661663, 0.138902, 255, 78, 118, 
        0.320000, 0.661920, 0.096621, 255, 78, 118, 
        -0.320000, -0.645776, 0.096621, 255, 78, 118, 
        -0.320000, -0.807220, 0.096621, 255, 114, 146, 
        -0.236616, 0.746555, 0.138902, 255, 78, 118, 
        0.312263, 0.787702, -0.216586, 74, 23, 34, 
        0.262400, 0.661920, -0.221167, 64, 20, 30, 
        0.262400, 0.807220, -0.221167, 65, 20, 31, 
        0.320000, 0.807220, -0.138902, 195, 60, 90, 
        -0.320000, -0.645776, -0.221167, 64, 20, 30, 
        -0.295790, 0.661663, 0.138902, 255, 80, 120, 
        -0.312263, 0.787702, -0.216586, 89, 28, 42, 
        -0.256000, 0.661920, -0.221167, 132, 41, 61, 
        -0.320000, 0.661920, -0.221167, 249, 76, 115, 
        0.242694, 0.746555, 0.138902, 255, 78, 118, 
        0.262400, 0.661920, 0.138902, 255, 78, 118, 
        0.262400, -0.645776, 0.138902, 255, 78, 118, 
        -0.320000, -0.645776, -0.221167, 255, 84, 122, 
        -0.320000, 0.661920, -0.221167, 222, 68, 103, 
        -0.256000, 0.807220, -0.138902, 255, 78, 118, 
        -0.320000, 0.807220, -0.138902, 255, 78, 118, 
        -0.256000, -0.645776, -0.221167, 65, 20, 31, 
        0.242694, -0.746149, 0.138902, 255, 78, 118, 
        0.262400, -0.807220, -0.138902, 255, 78, 118, 
        0.262400, -0.807220, 0.096621, 255, 78, 118, 
        -0.256000, 0.807220, 0.096621, 255, 78, 118, 
        0.320000, -0.807220, -0.138902, 255, 78, 118, 
        0.295951, -0.646330, 0.138902, 255, 78, 118, 
        -0.256000, 0.807220, -0.221167, 217, 66, 100, 
        0.262400, 0.661920, -0.221167, 129, 40, 60, 
        -0.256000, -0.645776, -0.221167, 203, 62, 93, 
        -0.256000, 0.661920, -0.221167, 64, 20, 30, 
        0.262400, 0.807220, -0.138902, 212, 65, 97, 
        -0.256000, 0.807220, -0.221167, 64, 20, 30, 
        -0.256000, -0.645776, -0.221167, 64, 20, 30, 
        -0.256000, 0.807220, -0.116580, 255, 78, 118, 
        0.320000, -0.807220, -0.116580, 255, 78, 118, 
        -0.320000, 0.807220, -0.116580, 255, 78, 118, 
        0.262400, -0.807220, -0.116580, 255, 78, 118, 
        -0.320000, -0.645776, -0.116580, 255, 78, 118, 
        0.320000, 0.807220, -0.116580, 255, 78, 118, 
        -0.320000, -0.807220, -0.116580, 255, 78, 118, 
        0.320000, 0.661920, -0.116580, 253, 77, 117, 
        0.320000, -0.645776, -0.138902, 255, 78, 118, 
        -0.256000, -0.807220, -0.116580, 255, 78, 118, 
        0.320000, -0.645776, -0.116580, 255, 78, 118, 
        0.262400, 0.807220, -0.116580, 255, 78, 118, 
        -0.320000, 0.661920, -0.116580, 255, 78, 118, 
        -0.295790, -0.646330, 0.138902, 255, 78, 118, 
        0.320000, 0.661920, -0.221167, 66, 21, 31, 
        -0.256000, 0.661920, -0.221167, 86, 27, 40, 
        -0.256000, -0.645776, -0.221167, 230, 70, 106, 
        -0.256000, -0.807220, -0.221167, 119, 37, 56, 
        -0.312263, -0.787702, -0.216586, 81, 25, 38, 
        -0.256000, -0.807220, -0.221167, 116, 36, 55, 
        -0.320000, -0.807220, 0.096621, 255, 82, 122, 
    ];

    obj.vertices = obj.vertices.map((v, i) => {
        if (i % 6 >= 3) {
            return v / 255;
        }
        return v;
    })

    obj.indices = [
        0, 1, 2, 
        3, 4, 5, 
        6, 7, 8, 
        9, 10, 11, 
        12, 13, 14, 
        15, 10, 16, 
        17, 18, 19, 
        20, 21, 22, 
        23, 24, 25, 
        26, 18, 27, 
        26, 28, 29, 
        30, 13, 31, 
        28, 32, 33, 
        34, 15, 35, 
        36, 6, 37, 
        10, 38, 39, 
        4, 37, 5, 
        1, 35, 40, 
        41, 42, 43, 
        29, 21, 44, 
        23, 45, 30, 
        38, 46, 0, 
        47, 48, 49, 
        50, 35, 51, 
        35, 52, 51, 
        48, 53, 54, 
        55, 24, 56, 
        57, 13, 45, 
        15, 58, 52, 
        12, 19, 59, 
        58, 9, 60, 
        1, 61, 2, 
        7, 60, 8, 
        59, 18, 62, 
        52, 7, 63, 
        36, 52, 63, 
        4, 51, 36, 
        43, 48, 64, 
        65, 66, 67, 
        68, 69, 55, 
        17, 14, 70, 
        61, 50, 3, 
        71, 68, 55, 
        72, 59, 62, 
        73, 55, 56, 
        74, 12, 59, 
        75, 23, 30, 
        76, 29, 44, 
        77, 30, 31, 
        78, 79, 29, 
        80, 31, 12, 
        81, 62, 26, 
        82, 44, 68, 
        83, 56, 23, 
        61, 82, 71, 
        8, 74, 72, 
        73, 61, 71, 
        60, 80, 74, 
        38, 83, 75, 
        5, 78, 76, 
        77, 38, 75, 
        37, 81, 78, 
        80, 11, 77, 
        6, 72, 81, 
        3, 76, 82, 
        0, 73, 83, 
        0, 46, 1, 
        3, 50, 4, 
        6, 63, 7, 
        9, 16, 10, 
        12, 31, 13, 
        15, 84, 10, 
        17, 27, 18, 
        68, 44, 21, 
        23, 56, 24, 
        26, 62, 18, 
        26, 27, 28, 
        30, 45, 13, 
        85, 27, 17, 
        34, 84, 15, 
        36, 63, 6, 
        10, 84, 38, 
        4, 36, 37, 
        1, 34, 35, 
        41, 28, 42, 
        29, 28, 21, 
        23, 25, 45, 
        38, 84, 46, 
        47, 64, 48, 
        50, 40, 35, 
        35, 15, 52, 
        86, 70, 53, 
        55, 69, 24, 
        87, 88, 89, 
        15, 16, 58, 
        12, 14, 19, 
        58, 16, 9, 
        1, 40, 61, 
        7, 58, 60, 
        59, 19, 18, 
        52, 58, 7, 
        36, 51, 52, 
        4, 50, 51, 
        43, 65, 48, 
        42, 17, 87, 
        68, 22, 69, 
        17, 19, 90, 
        61, 40, 50, 
        71, 82, 68, 
        72, 74, 59, 
        73, 71, 55, 
        74, 80, 12, 
        75, 83, 23, 
        76, 78, 29, 
        77, 75, 30, 
        78, 81, 26, 
        80, 77, 31, 
        81, 72, 62, 
        82, 76, 44, 
        83, 73, 56, 
        61, 3, 82, 
        8, 60, 74, 
        73, 2, 61, 
        60, 9, 80, 
        38, 0, 83, 
        5, 37, 78, 
        77, 91, 38, 
        37, 6, 81, 
        80, 9, 11, 
        6, 8, 72, 
        3, 5, 76, 
        0, 2, 73, 
    ];
}