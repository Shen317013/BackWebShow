<template>
	<div class="ImportLogs">
		<el-upload class="file-drop" drag action="/api/importlogs/upload-file" :before-upload="handleBeforeUpload"
			:on-success="handleUploadSuccess" :on-error="handleUploadError" style="margin: 0.5%;">
			<div class="drop-area">
				<i class="el-icon-upload"></i>
				<div class="upload-text">將文件拖曳到這裡上傳</div>
			</div>
		</el-upload>

		<el-button @click="restoreInitialState" type="danger" style="margin-left: 0.5%;">還原</el-button>


		<!-- 新增搜尋欄位 -->
		<el-form :model="searchForm" inline class="search-container" style="margin-top: 1%; margin-left: 0.5%;">
			<el-form-item label="搜尋欄位">
				<el-select v-model="searchForm.searchField" placeholder="請選擇" @change="handleFieldChange">
					<el-option label="無" value=""></el-option>
					<el-option label="帳號ID" value="accid"></el-option>
					<el-option label="角色ID" value="chrid"></el-option>
					<el-option label="角色名字" value="chrname"></el-option>
					<el-option label="花費物品代碼" value="gift1"></el-option>
					<el-option label="花費物品數量" value="giftnum1"></el-option>
					<el-option label="獲得物品代碼" value="gift2"></el-option>
					<el-option label="獲得物品數量" value="giftnum2"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="關鍵字">
				<el-input v-model="searchForm.keyword" placeholder="請輸入關鍵字"></el-input>
			</el-form-item>
			<el-form-item label="時間欄位">
				<el-select v-model="searchForm.timeField" placeholder="請選擇" @change="handleTimeFieldChange">
					<el-option label="無" value=""></el-option>
					<el-option label="日期" value="date"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="起始日期">
				<el-date-picker v-model="searchForm.startTime" type="date" placeholder="請選擇日期"></el-date-picker>
			</el-form-item>
			<el-form-item label="結束日期">
				<el-date-picker v-model="searchForm.endTime" type="date" placeholder="請選擇日期"></el-date-picker>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="handleSearch"
					:disabled="!(searchForm.keyword || (searchForm.startTime && searchForm.endTime))">搜尋</el-button>
				<el-button type="danger" @click="clearQuery">清空</el-button>
			</el-form-item>

			<el-alert v-for="(resultCount, searchIndex) in searchAnswers" :key="searchIndex" v-if="resultCount > 0"
				:title="`${resultCount} 筆搜尋結果`" type="info" show-icon />
			<el-alert :title="`${totalResultCount} 筆搜尋結果總和`" type="info" show-icon />


		</el-form>

		<el-button @click="openColumnSelectionDialog" class="left-button" style="margin: 1%;">選擇要顯示的欄位</el-button>
		<el-button @click="calculateTotalResultCount" type="info">計算搜尋總和</el-button>
		<!-- 選擇要關閉的欄位視窗 -->
		<el-dialog :visible.sync="columnSelectionDialogVisible" title="選擇要顯示的欄位"
			@close="columnSelectionDialogVisible = false">
			<el-checkbox v-model="unselectAllColumns" @change="handleUnselectAllColumns">全部不選</el-checkbox>
			<el-checkbox-group v-model="selectedColumns">
				<el-checkbox v-for="column in tableColumns" :key="column.prop"
					:label="column.prop">{{ column.label }}</el-checkbox>
			</el-checkbox-group>
			<el-button @click="applyColumnSelection" style="margin-top: 1%;">確認</el-button>
		</el-dialog>


		<el-table :data="tableData" border style="width: 100%">
			<!-- 使用 v-if 根據visible的狀態選擇顯示 -->
			<el-table-column v-if="column.visible" v-for="(column, index) in tableColumns" :key="index"
				:prop="column.prop" :label="column.label" :width="column.width">
				<template slot-scope="scope">
					<div style="white-space: nowrap; overflow: auto;">
						{{ column.formatter ? column.formatter(scope.row[column.prop]) : scope.row[column.prop] }}
					</div>
				</template>
			</el-table-column>

		</el-table>

		<!-- 分頁結構 -->
		<el-pagination :page-sizes="paginations.page_sizes" :page-size="paginations.page_size"
			:layout="paginations.layout" :total="paginations.total" :current-page.sync="paginations.page_index"
			@current-change="handleCurrentChange" @size-change="handleSizeChange"></el-pagination>

	</div>
</template>

<script>
	export default {
		name: "importlogs",
		data() {
			return {
				totalResultCount: 0,
				searchnum: 0,
				searchAnswers: {},
				tableData: [],
				isFileDropped: false,
				searchForm: {
					searchField: "",
					timeField: "",
					keyword: "",
					allTableData: [],
					filteredData: [],
					startTime: "", // 新增起始日期
					endTime: "" // 新增結束日期
				},
				paginations: {
					page_index: 1,
					total: 0,
					page_size: 15,
					page_sizes: [5, 10, 15, 20],
					layout: "total,sizes,prev,pager,next,jumper",
				},
				isSearchButtonClicked: false,
				unselectAllColumns: false,
				columnSelectionDialogVisible: false,
				selectedColumns: [],
				tableColumns: [{
						prop: 'date',
						label: '日期',
						visible: true,
					},
					{
						prop: 'time',
						label: '時間',
						visible: true,
					},
					{
						prop: 'mac',
						label: 'mac',
						visible: true,
					},
					{
						prop: 'accid',
						label: '帳號ID',
						visible: true,
					},
					{
						prop: 'chrid',
						label: '角色ID',
						visible: true,
					},
					{
						prop: 'donate',
						label: '贊助金額',
						visible: true,
					},
					{
						prop: 'chrlevel',
						label: '角色等級',
						visible: true,
					},
					{
						prop: 'eqscore',
						label: '裝備等級',
						visible: true,
					},
					{
						prop: 'chrname',
						label: '角色名字',
						visible: true,
					},
					{
						prop: 'gift1',
						label: '花費物品',
						visible: true,
					},
					{
						prop: 'giftname1',
						label: '花費物品名字',
						visible: true,
					},
					{
						prop: 'giftnum1',
						label: '花費數量',
						visible: true
					},
					{
						prop: 'gift2',
						label: '獲得物品',
						visible: true,
					},
					{
						prop: 'giftname2',
						label: '獲得物品名字',
						visible: true,
					},
					{
						prop: 'giftnum2',
						label: '獲得數量',
						visible: true
					},
				],
			};
		},

		methods: {
			async getFileContent(filePath) {
				try {
					const response = await this.$axios.get(
						`/api/importlogs/get-file-content?filePath=${encodeURIComponent(filePath)}`);
					const content = response.data.content;
					this.allTableData = this.parseLogFile(content);
					this.setPaginations();
					//	this.handleSearch();
				} catch (error) {
					console.error('獲取文件內容失敗：', error);
				}
			},

			handleBeforeUpload(file) {
				console.log('上傳前處理:', file);
			},

			handleUploadSuccess(response, file) {
				console.log('上傳成功:', response, file);
				this.getFileContent(response.filePath); // 傳遞文件路徑給後端
				this.isFileDropped = true;
			},

			handleUploadError(error, file) {
				console.error('上傳失敗:', error, file);
			},

			restoreInitialState() {
				this.allTableData = []; // 清空已拖曳的文件数据
				this.setPaginations();
				this.handleSearch();
				this.isFileDropped = false;
				this.$refs.upload.clearFiles();
			},

			//解析文件為數組
			parseLogFile(content) {
				//每行分行
				const lines = content.split('\n');
				const data = lines
					.filter(line => line.trim() !== '') // 過濾掉空行
					.map(line => {
						const [date, time, mac, accid, chrid, donate, chrlevel, eqscore, chrname, get, gift1,
							giftname1, giftnum1, gift2, giftname2, giftnum2
						] = line
							.split(' ');
						return {
							date,
							time,
							mac,
							accid,
							chrid,
							donate,
							chrlevel,
							eqscore,
							chrname,
							get,
							gift1,
							giftname1,
							giftnum1,
							gift2,
							giftname2,
							giftnum2,
						};
					});
				return data;
			},

			handleSearch() {
				this.isSearchButtonClicked = true;
				this.searchnum += 1;

				// 在 handleSearch 方法中，根據選擇的搜索欄位和日期範圍進行數據過濾
				const {
					searchField,
					keyword,
					timeField,
					startTime,
					endTime
				} = this.searchForm;

				this.filteredData = this.allTableData.filter((item) => {
					const fieldValue = item[searchField];
					const fieldTimeValue = item[timeField];

					// 只有姓名搜索
					if (searchField && !timeField) {
						return fieldValue && fieldValue.toString().toLowerCase().includes(keyword.toLowerCase());
					}

					// 只有時間搜索
					if (!searchField && timeField) {
						return fieldTimeValue && startTime && endTime &&
							new Date(fieldTimeValue) >= new Date(startTime) &&
							new Date(fieldTimeValue) <= new Date(endTime);
					}

					// 同時滿足姓名匹配和時間範圍匹配的條件
					if (searchField && timeField) {
						const isNameMatch = fieldValue && fieldValue.toString().toLowerCase().includes(keyword
							.toLowerCase());
						const isTimeMatch = fieldTimeValue && startTime && endTime &&
							new Date(fieldTimeValue) >= new Date(startTime) &&
							new Date(fieldTimeValue) <= new Date(endTime);

						return isNameMatch && isTimeMatch;
					}

					// 預設情況，即 searchField 和 timeField 都不存在時返回 true
					return true;
				});

				this.paginations.total = this.filteredData.length;
				this.paginations.page_index = 1;
				this.$set(this.searchAnswers, this.searchnum, this.filteredData.length);

				const startIndex = (this.paginations.page_index - 1) * this.paginations.page_size;
				this.tableData = this.filteredData.slice(startIndex, startIndex + this.paginations.page_size);
				this.isSearchButtonClicked = false;
			},

			calculateTotalResultCount() {
				this.totalResultCount = Object.values(this.searchAnswers).reduce((sum, count) => sum + count, 0);
			},


			setPaginations() {
				// 分頁屬性設置
				this.paginations.total = this.allTableData.length;
				this.paginations.page_index = 1;

				// 設置默認的分頁數據
				this.filteredData = this.allTableData; // 将 allTableData 分配给 filteredData

				this.tableData = this.paginateData(this.allTableData);
			},

			clearQuery() {
				this.searchForm.keyword = '';
				this.searchForm.startTime = '';
				this.searchForm.endTime = '';
				this.searchnum = 0;
				this.searchAnswers = {};
			},

			handleFieldChange() {
				// 在欄位更改時，重新設置 tableData 和分頁相關的屬性
				this.setPaginations();

				// 只有在搜尋按鈕被點擊且有輸入關鍵字的情況下才進行搜尋
				if (this.isSearchButtonClicked && this.searchForm.keyword && this.searchForm.keyword !== null) {
					this.handleSearch();
				} else {
					// 如果沒有輸入關鍵字，則使用 allTableData
					this.tableData = this.paginateData(this.allTableData);

					this.paginations.total = this.allTableData.length;
				}

				// 清空關鍵字
				this.searchForm.keyword = '';
				this.searchForm.startTime = '';
				this.searchForm.endTime = '';

				// 重置搜尋按鈕點擊狀態
				this.isSearchButtonClicked = false;
			},

			handleTimeFieldChange() {
				// 在欄位更改時，重新設置 tableData 和分頁相關的屬性
				this.setPaginations();

				// 只有在搜尋按鈕被點擊且有輸入關鍵字的情況下才進行搜尋
				if (this.isSearchButtonClicked && this.searchForm.startTime && this.searchForm.endTime) {
					this.handleSearch();
				} else {
					// 如果沒有輸入關鍵字，則使用 allTableData
					this.tableData = this.paginateData(this.allTableData);

					this.paginations.total = this.allTableData.length;
				}

				// 清空關鍵字
				this.searchForm.startTime = '';
				this.searchForm.endTime = '';

				// 重置搜尋按鈕點擊狀態
				this.isSearchButtonClicked = false;
			},


			paginateData(data) {
				const startIndex = (this.paginations.page_index - 1) * this.paginations.page_size;
				return data.slice(startIndex, startIndex + this.paginations.page_size);
			},

			handleCurrentChange(page) {
				// 更新 paginations 的 page_index
				this.paginations.page_index = page;

				// 重新計算 startIndex 和 endIndex
				const startIndex = (page - 1) * this.paginations.page_size;
				const endIndex = startIndex + this.paginations.page_size;

				// 根據 startIndex 和 endIndex 篩選數據
				const dataToUse = this.searchForm.keyword || this.searchForm.startTime && this.searchForm.endTime ? this
					.filteredData : this.allTableData;
				const paginatedData = dataToUse.slice(startIndex, endIndex);

				// 更新 tableData
				this.tableData = paginatedData;

				// 更新 paginations 的 total
				this.paginations.total = dataToUse.length;
			},


			handleSizeChange(page_size) {
				// 切換每頁顯示條數
				this.paginations.page_size = page_size;

				// 在调用 paginateData 之前检查 this.filteredData 是否为数组
				if (Array.isArray(this.filteredData)) {
					// 重新計算 total，並更新 tableData
					this.paginations.total = this.paginateData(this.filteredData).length;

					// 確保獲取了新的搜尋欄位值，然後再進行搜索
					this.handleSearch();
				} else {
					console.error('this.filteredData 不是有效的數組:', this.filteredData);
				}
			},

			handleUnselectAllColumns() {
				if (this.unselectAllColumns) {
					this.selectedColumns = [];
					this.unselectAllColumns = false;
				}
			},

			applyColumnSelection() {
				this.tableColumns.forEach(column => {
					column.visible = this.selectedColumns.includes(column.prop);
				});
				this.columnSelectionDialogVisible = false;
			},

			openColumnSelectionDialog() {
				this.selectedColumns = this.tableColumns.filter(column => column.visible).map(column => column.prop);
				this.columnSelectionDialogVisible = true;
			},


		},
	};
</script>

<style>

</style>