// Функция, которая возвращает первые amount_of_nums встреченных чисел в строке.
// Справедливым является замечание про регулярные выражения, однако я пока не так силён
// и в них и в JS, чтобы использовать их в таком нетривиальном примере.
// Функция, которая возвращает первые amount_of_nums встреченных чисел в строке
function get_nums(amount_of_nums, some_str) {
    some_res = new Array(amount_of_nums);
    figures = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '[', ']']; j = 0;
    for(k = 0; k < amount_of_nums; k++) {
        started = false; some_num = '';
        while((!started || (started && some_str[j] != ' ')) && j < some_str.length) {
            if (figures.includes(some_str[j])) {
                if (!started) started = true;
                some_num += some_str[j];
            }
            else if (some_str[j] != ' ')
                // Если встретили какой-то иной символ, отличный от пробела
                throw new Error("ArgumentsError: incorrect arguments\nAt line " + l + ': ' + code[l]); 
            j++;
        }
        // Если не нашли какой-то из аргументов, сигнализируем об этом с помощью -1, 
        // тогда в функции check будет выведена соответствующая ошибка.
        some_res[k] = (some_num == '') ? -1 : some_num;
    }
    return some_res;
}

// Функция, которая проверяет корректность переданного(-ых) аргументов к функциям
function check(indexes_of_memory_cells, line, some_operation) {
    // Отдельный блок под input/output
    if (['input', 'output'].includes(some_operation)) {
        if (indexes_of_memory_cells instanceof Array) {
            throw new Error('ArgumentsError: for the ' + (some_operation == 'input' ? 'input' : 'output') + ' operation you must give only ' +
            'one adress\nAt line ' + line + ': ' + code[line]);
        }
        if (indexes_of_memory_cells[0].indexOf('[') == -1) {
            throw new Error('ArgumentsError: for the ' + (some_operation == 'input' ? 'input' : 'output') + ' operation you must give adress ' +
            'of memory cell, not number\nAt line ' + line + ': ' + code[line]);
        }
        check_one(indexes_of_memory_cells, line, some_operation);
    }
    // Если передан только один аргумент
    else if (!(indexes_of_memory_cells instanceof Array)) {
        // То и проверяем только один
        check_one(indexes_of_memory_cells, line, some_operation);
    }
    else {
        // Иначе проверяем все
        for (some of indexes_of_memory_cells) {
            // Проверяем, является ли последний из трёх аргументов ссылкой на память (т.е. куда нужно записать результат)
            // Обращение к indexes_of_memory_cells[2] никогда не нарушит границы, т.к. операции input/output рассмотрены отдельно,
            // а аргумент к goto не проверяется в этой функции. Остаются только операции, у которых всегда три аргумента
            if (some == indexes_of_memory_cells[2] && !(some.includes('['))) {
                throw new Error('ArgumentsError: for the ' + some_operation + ' operation, the third argument must be a memory'+ 
                'reference\nAt line ' + line + ': ' + code[line]);
            }
            // Остальные проверки в отдельной функции
            check_one(some, line, some_operation);
        }
    }
}

function check_one(some, line, some_operation) {
    // Если перед нами число, а не указатель на память, то в принципе оно может быть совершенно любым
    if (!some.includes('[', ']')) {
        return;
    } 
    // Проверяем соответствие адреса шаблону [1-3 цифры]
    if (some.match(/(\[:?)\d{1,3}(\]:?)$/i) == null) {
        throw new Error('ArgumentsError: incorrect adress\nAt line ' + line + ': ' + code[line]);
    }
    // Приводим к численному виду, чтобы провести дальнейшие проверки
    index = Number(some.replace('[', '').replace(']', ''));
    // -1 это кодовое обозначение того, что в функции get_nums не нашлось одного или нескольких аргументов
    if (index == -1) {
        throw new Error('ArgumentsError: ' + some_operation + ' operation requires 3 arguments\
        \nAt line ' + line + ': ' + code[line]);
    }
    // Проверка на выход за границу массива memory
    if (index < 0 || index > 999) {
        throw new Error('MemoryError: the index of memory cell must belong to the interval [0,999]\
        \nAt line ' + line + ': ' + code[line]);
    }
}

fs = require("fs");
// Открываем файл, название которого передаётся через аргумент консоли
code = fs.readFileSync(process.argv[2], "utf8").split("\n");
// Создаём заполненный нулями массив эмулированный памяти длиной 1000
memory = new Array(1000);
memory.fill(0);
// Я научился использовать prompt...
ps = require('prompt-sync');
prompt = ps();
// Считываем код по строчкам
l = 0;
while (l < code.length) {
    // Берём очередную строку кода, убираем перенос в конце
    str = code[l]; str = str.replaceAll('\r', '').replaceAll('\n', '')
    // Булевская переменная, отражающая была ли выполненая какая-нибудь операция в текущей строке
    understood = false;
    // Сделал комментарии
    if (str.slice(0, 2) == '//') { l++; continue; }
    // Ввод
    // Чтобы от лишнего пробела в начале строки всё не ломалось, сделал через indexOf 
    // (на самом деле ради перфекционизма, табуляции после if'a красивые ставить)
    else if (str.indexOf("input") != -1) {
        // А тут уже чёткий синтаксис, только input [n], где 0 <= n < 1000
        index = String(get_nums(1, str.slice(str.indexOf('input') + 6))[0]);
        check(index, l, 'input');
        // Собственно ввод
        value = prompt("Enter the value of memory cell " + index + ": ");
        // Проверяем, является ли введённое значение корректным
        if (Number(value) == NaN || value == '' || value == null) throw new Error('InputError: the entered value must be a number');
        // Присваиваем обозначенной ячейке памяти введённое значение 
        // (магическим образом после вызова функции check, index превращается в число, поэтому здесь к нему не приводится)
        memory[index] = Number(value); 
        understood = true;
    }
    // Вывод, стоит else if потому что в моём языке строго одна команда в строку
    else if (str.indexOf("output") != -1) {
        index = String(get_nums(1, str.slice(str.indexOf('output') + 7))[0]);
        check(index, l, 'input');
        console.log(memory[index]); 
        understood = true;
    }
    else {
        // Далее идут операции, синтаксис одинаков: add/sub/div/mul/rem cell1 cell2 cell_for_res
        // rem, кстати, от remainder - остаток от деления cell1 на cell2, записанный в cell_for_res
        operations = [["add", '+'], ["sub", '-'], ["div", '/'], ["mul", '*'], ["rem", '%']];
        for (operation of operations) {
            if (str.indexOf(operation[0]) != -1) {
                args = get_nums(3, str.slice(str.indexOf(operation[0]) + 4));
                check(args, l, operation[0]);
                args[2] = args[2].replace('[', '').replace(']', '');
                // Если оба аргумента - ссылки (третий всегда является ссылкой)
                if (args[0].includes("[") && args[1].includes("[")) {
                    args[0] = args[0].replace('[', '').replace(']', '');
                    args[1] = args[1].replace('[', '').replace(']', '');
                    // Чит, пользуемся тем, что JS - интерпретируемый ЯП (зато без тысячи if'ов)
                    eval('memory[args[2]] = memory[args[0]]' + operation[1] + 'memory[args[1]]');
                    }
                // Если только первый аргумент - ссылка
                else if (args[0].includes("[")) {
                    args[0] = args[0].replace('[', '').replace(']', '');
                    eval('memory[args[2]] = memory[args[0]]' + operation[1] + 'Number(args[1])');
                }
                // Если только второй аргумент - ссылка
                else if (args[1].includes["["]) {
                    args[1] = args[1].replace('[', '').replace(']', '');
                    eval('memory[args[2]] = Number(args[0])' + operation[1] + 'memory[args[1]]');
                }
                // И, наконец, когда оба аргумента - числа. Не совсем понятно, зачем такое может
                // пригодиться, но такую возможность предоставить необходимо.
                else 
                    eval("memory[args[2]] = Number(args[0])" + operation[1] + 'Number(args[1])');
                understood = true; break;
            }
        }
        // Операция goto. Очень полезная, заменяет в совокупности с if'ом цикл.
        if (str.indexOf("goto") != -1) {
            new_line = Number(get_nums(1, str.slice(str.indexOf('goto') + 5))[0]);
            // Проверяем валидность адреса строки
            if (new_line < 0 || new_line > code.length)
                throw new Error("ArgumentsError: incorrect line number for goto\nAt line " + l + ': ' + str);
            // -2 т.к. l инкременируется в конце шага цикла
            l = new_line - 2; understood = true;
        }
        // Я сделал свой if. Его синтаксис таков: if (условие) { действия в разных строках }
        // Условие должно соответствовать синтаксису условий в JS. Открытие if'а должно быть в той же строке, что и if
        // Закрытие if'а должно быть в отдельной строке.
        else if (str.indexOf("if") != -1) {
            // "Вырезаем" условие (скобки, фигурные и круглые, на самом деле не нужны, нужна только закрывающая фигурная)
            comprasion = str.slice(str.indexOf("if") + 3);
            // И если наличие круглых скобок я не считаю обязательным, то вот открытие и закрытие if'a - обязательно.
            if (!comprasion.includes('{')) throw new Error('SyntaxError: no "if" opening ("{")\nAt line ' + l + ": " + str);
            comprasion = comprasion.replace('{', '');
            // Меняем ссылки на значения
            while(comprasion.indexOf("[") != -1) {
                adress = comprasion.slice(comprasion.indexOf('[') + 1, comprasion.indexOf("]"));
                comprasion = comprasion.replace('[' + adress + ']', memory[Number(adress)]);
            }
            // Пропускаем следующие строки до закрытия if, если условие не выполняется
            if (!eval(comprasion)) {
                // Нужно найти закрывающую скобку по-умному, т.к. if-ы могут быть вложенными
                skipped_lines = 0; p = l + 1;
                opened_braces = 0; closed_braces = 0;
                while (closed_braces != opened_braces + 1) { 
                    // Если следующая строка - последняя, а мы так и не нашли закрывающую скобку
                    if (p + 1 > code.length - 1)
                        // Выводим соответствующую ошибку
                        throw new Error('SyntaxError: "if" opened, but not closed\nAt line ' + l + ': ' + str);
                    if (code[p].includes('{')) opened_braces++;
                    if (code[p].includes('}')) closed_braces++;
                    skipped_lines++; p++; 
                }
                l += skipped_lines;
            }
            understood = true;
        }
        // На строки кода, которые не являются операциями или комментариями выводим соответствующую ошибку.
    }
    // Если текущая строка не является командой или закрыванием if'а
    if (!understood && !Array.from(new Set(str)).every(elem => [' ', '}', '\t', '\n', '\r'].includes(elem)))
        // То эта строка не может быть выполнена, о чём и сообщаем пользователю. Напомню, что
        // если строка - комментарий, то происходит l++ и continue, до сюда интерпретатор не доходит
        throw new Error("SyntaxError: interpreter cannot understand your code\nAt line " + l + ': ' + str);
    l++;
}