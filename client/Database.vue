<template>
	<div>
		<!-- 新增SQL語法搜尋欄位 -->
		<el-form :model="sqlSearchForm" inline class="sql-container">
			<el-form-item label="SQL語法">
				<el-input v-model="sqlSearchForm.sqlQuery" placeholder="請輸入SQL語法" class="sql-input"></el-input>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="handleSqlSearch">SQL搜尋</el-button>
				<el-button type="danger" @click="clearSqlQuery">清空</el-button>
			</el-form-item>
		</el-form>

		<!-- 新增搜尋欄位 -->
		<el-form :model="searchForm" inline class="search-container">
			<el-form-item label="搜尋欄位">
				<el-select v-model="searchForm.searchField" placeholder="請選擇" @change="handleFieldChange">
					<el-option label="無" value=""></el-option>
					<el-option v-for="column in tableColumns" :key="column.prop" :label="column.label"
						:value="column.prop"
						v-if="column.prop !== 'createdate' && column.prop !== 'birthday'&& column.prop !== 'lastlogin'&& column.prop !== 'lastlogon'"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="關鍵字">
				<el-input v-model="searchForm.keyword" placeholder="請輸入關鍵字"></el-input>
			</el-form-item>
			<el-form-item label="時間欄位">
				<el-select v-model="searchForm.timeField" placeholder="請選擇" @change="handleTimeFieldChange">
					<el-option label="無" value=""></el-option>
					<el-option label="日期" value="createdate"></el-option>
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
					:disabled="!(searchForm.keyword || (searchForm.startTime && searchForm.endTime))">欄位搜尋</el-button>
				<el-button type="danger" @click="clearSqlQuery">清空</el-button>
			</el-form-item>

			<el-alert v-for="(resultCount, searchIndex) in searchAnswers" :key="searchIndex" v-if="resultCount > 0"
				:title="`${resultCount} 筆搜尋結果`" type="info" show-icon />
			<el-alert :title="`${totalResultCount} 筆搜尋結果總和`" type="info" show-icon />


		</el-form>

		<!-- 新增一併系列按鈕 -->
		<div class="table-toolbar" style="margin-bottom: 1%;">
			<el-button @click="openColumnSelectionDialog" class="left-button">選擇要顯示的欄位</el-button>
			<el-button @click="openAddDialog" type="primary">新增數據</el-button>
			<el-button @click="calculateTotalResultCount" type="info">計算搜尋總和</el-button>
			<el-button @click="exportTxt" type="success">導出TXT</el-button>
			<el-button @click="openModifyDialog" type="primary">一併修改</el-button>
			<el-button @click="confirmDeleteAll" type="danger">一併刪除(全)</el-button>
			<el-button @click="confirmDeleteSearch" type="danger">一併刪除(頁)</el-button>
		</div>

		<!-- 一併修改確認視窗 -->
		<el-dialog :visible="modifyDialogVisibleAll" title="一併修改（全部）" @close="modifyDialogVisibleAll = false">
			<el-form :model="modifyFormDataAll" ref="modifyFormAll" label-width="80px">
				<el-form-item label="選擇欄位">
					<el-select v-model="selectedField" placeholder="請選擇欄位">
						<el-option v-for="field in tableColumns" :key="field.prop" :label="field.label"
							:value="field.prop"
							v-if="field.prop !== 'createdate' && field.prop !== 'birthday'&& field.prop !== 'lastlogin'&& field.prop !== 'lastlogon'"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="新的值">
					<el-input v-model="newValue"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleModifyAll">確認修改</el-button>
					<el-button @click="modifyDialogVisibleAll = false">取消</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>

		<!-- 一併刪除(全)確認視窗 -->
		<el-dialog :visible="deleteAllDialogVisible" title="確認一併刪除（全部）" @close="deleteAllDialogVisible = false">
			<p>是否要刪除搜索到的所有數據?</p>
			<span slot="footer" class="dialog-footer">
				<el-button type="primary" @click="handleDeleteAll">確認刪除</el-button>
				<el-button @click="deleteAllDialogVisible = false">取消</el-button>
			</span>
		</el-dialog>

		<!-- 一併刪除(頁)確認視窗 -->
		<el-dialog :visible="deleteSearchDialogVisible" title="確認一併刪除（當前頁）" @close="deleteSearchDialogVisible = false">
			<p>是否要刪除目前顯示的所有數據?</p>
			<span slot="footer" class="dialog-footer">
				<el-button type="primary" @click="handleDeleteSearch">確認刪除</el-button>
				<el-button @click="deleteSearchDialogVisible = false">取消</el-button>
			</span>
		</el-dialog>

		<!-- 原始資料數據 -->
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

			<!-- 操作列 -->
			<el-table-column label="操作" width="200">
				<template slot-scope="scope">
					<el-button @click="showModifyDialog(scope.row)" type="primary" size="mini">修改</el-button>
					<el-button @click="confirmDelete(scope.row)" type="danger" size="mini">刪除</el-button>
				</template>
			</el-table-column>
		</el-table>

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

		<!-- 刪除確認視窗 -->
		<el-dialog :visible="deleteDialogVisible" title="確認刪除" @close="deleteDialogVisible = false">
			<p>是否要刪除該條數據</p>
			<span slot="footer" class="dialog-footer">
				<el-button type="primary" @click="handleDelete">確認刪除</el-button>
				<el-button @click="deleteDialogVisible = false">取消</el-button>
			</span>
		</el-dialog>

		<!-- 編輯 -->
		<el-dialog :visible="modifyDialogVisible" title="編輯數據" @close="modifyDialogVisible = false">
			<el-form :model="modifyFormData" ref="modifyForm" label-width="80px">
				<el-form-item v-for="field in tableColumns" :key="field.prop" :label="field.label"
					v-if="field.prop !== 'createdate' && field.prop !== 'birthday' && field.prop !== 'lastlogin' && field.prop !== 'lastlogon'">
					<!-- 判斷欄位的類型，生成對應的表單元素 -->
					<template v-if="field.formatter && typeof field.formatter === 'function'">
						<!-- 如果有 formatter 函數，使用該函數格式化顯示 -->
						<el-input v-model="modifyFormData[field.prop]" :placeholder="'請輸入' + field.label"></el-input>
					</template>
					<template v-else>
						<!-- 沒有 formatter 函數，使用默認的 el-input -->
						<el-input v-model="modifyFormData[field.prop]" :placeholder="'請輸入' + field.label"></el-input>
					</template>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleModify">確認修改</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>

		<!-- 新增數據表單 -->
		<el-dialog title="新增數據" :visible.sync="addDialogVisible" width="30%">
			<el-form :model="addFormData">
				<el-form-item v-for="field in tableFields" :label="field" :key="field">
					<el-input v-model="addFormData[field]" />
				</el-form-item>
				<el-form-item>
					<el-button @click="handleAdd" type="primary">新增</el-button>
					<el-button @click="cancelAdd">取消</el-button>
				</el-form-item>
			</el-form>

		</el-dialog>

		<!-- 分頁結構 -->
		<el-pagination :page-sizes="paginations.page_sizes" :page-size="paginations.page_size"
			:layout="paginations.layout" :total="paginations.total" :current-page.sync='paginations.page_index'
			@current-change='handleCurrentChange' @size-change='handleSizeChange'>
		</el-pagination>

	</div>
</template>

<script>
	import moment from 'moment';


	export default {
		name: "database",
		data() {
			return {
				dataSheets: [{
						name: "accounts"
					},
					{
						name: "characters"
					},
					{
						name: "yunaccountlog"
					},
					{
						name: "accountbosslog"
					},
					{
						name: "eventpasslog"
					},
					{
						name: "wz_customlife"
					},
					{
						name: "logdata"
					},
					{
						name: "donate"
					},
					{
						name: "donate_logs"
					},
					{
						name: "guilds"
					},
					{
						name: "gmlog"
					},
					{
						name: "gvglog"
					},
					{
						name: "gvgranks"
					},
					{
						name: "inventoryitems"
					},
					{
						name: "macbans"
					},
					{
						name: "notes"
					},
					{
						name: "offlinegift"
					},
					{
						name: "prizelog"
					},
					{
						name: "queststatus"
					},
					{
						name: "speedranks"
					}
				],
				tableName: "",
				formData: {},
				addDialogVisible: false,
				addFormData: {},
				tableFields: [],
				totalResultCount: 0,
				searchnum: 0,
				searchAnswers: {},
				tableColumns: [],
				allTableData: [],
				columnSelectionDialogVisible: false,
				selectedColumns: [],
				unselectAllColumns: false,
				sqlSearchForm: {
					sqlQuery: "",
				},
				searchForm: {
					searchField: "", // 選擇搜尋欄位
					timeField: "", // 選擇搜尋欄位
					keyword: "", // 關鍵字
					startTime: "", // 新增起始日期
					endTime: "" // 新增結束日期
				},
				tableData: [],
				allTableData: [],
				deleteDialogVisible: false,
				modifyDialogVisible: false,
				modifyFormData: {},
				filteredData: [],
				rowToDelete: null,
				paginations: {
					page_index: 1, //當前位於哪頁
					total: 0, //總數
					page_size: 15, //一頁顯示多少條
					page_sizes: [5, 10, 15, 20], //每頁顯示多少條
					layout: "total,sizes,prev,pager,next,jumper" //翻頁屬性
				},
				isSearchButtonClicked: false,
				deleteSearchDialogVisible: false, // 控制一併刪除對話框的顯示
				deleteAllDialogVisible: false, // 控制一併刪除對話框的顯示
				modifyDialogVisibleAll: false,
				modifyFormDataAll: {},
				selectedField: "", // 選中的字段
				newValue: "", // 新的值

			};
		},
		created() {
			if (this.tableName == undefined) {
				this.tableName = this.$route.params.tableName;
				if (this.$route.params.tableName == undefined) {
					this.tableName = this.$store.state.tableName;
				}
			} else {
				this.tableName = this.$store.state.tableName;
			}

			this.getAxiosPath();
			this.getSearch();
		},
		methods: {
			getAxiosPath() {
				for (let i = 0; i < this.dataSheets.length; i++) {
					if (this.tableName === this.dataSheets[i].name) {
						this.axiospath = this.dataSheets[i].name;
					}
				}
			},

			getSearch() {
				this.$axios.get("/api/database/" + this.axiospath + "/search").then(res => {
					this.allTableData = res.data;
					this.generateTableColumns();
					this.generateFormFields();
					this.setPaginations();
				});
			},

			generateTableColumns() {
				const firstDataItem = this.allTableData.length > 0 ? this.allTableData[0] : {};

				// 根據第一筆資料的欄位生成 tableColumns
				this.tableColumns = Object.keys(firstDataItem).map(key => {
					let column = {
						prop: key,
						label: key.charAt(0).toUpperCase() + key.slice(1), // 將 key 的首字母轉為大寫
						visible: true,
						// 可根據需求添加其他屬性
					};


					// 在這裡你可以根據 key 或其他邏輯添加特定欄位的處理邏輯
					if (key === 'birthday' || key === "createdate" || key === "lastlogin" || key === "lastlogon") {
						column.formatter = (cellValue) => {
							// 使用 moment 或其他方法格式化日期
							return moment(cellValue).format('YYYY-MM-DD');
						};
					}


					return column;
				});
			},

			openColumnSelectionDialog() {
				this.selectedColumns = this.tableColumns.filter(column => column.visible).map(column => column.prop);
				this.columnSelectionDialogVisible = true;
			},
			applyColumnSelection() {
				this.tableColumns.forEach(column => {
					column.visible = this.selectedColumns.includes(column.prop);
				});
				this.columnSelectionDialogVisible = false;
			},
			handleUnselectAllColumns() {
				if (this.unselectAllColumns) {
					this.selectedColumns = [];
					this.unselectAllColumns = false;
				}
			},

			confirmDelete(row) {
				this.deleteDialogVisible = true;
				this.rowToDelete = row;
			},

			handleDelete() {
				if (this.rowToDelete) {
					const idToDelete = this.rowToDelete.id;
					this.$axios.delete(`/api/database/` + this.axiospath + `/delete/${idToDelete}`)
						.then(response => {
							console.log("刪除成功", response.data);
							this.getSearch();
						})
						.catch(error => {
							console.error("刪除失败", error);
						})
						.finally(() => {
							this.deleteDialogVisible = false;
							this.rowToDelete = null;
						});
				}
			},

			showModifyDialog(row) {
				this.modifyDialogVisible = true;
				this.modifyFormData = JSON.parse(JSON.stringify(row));
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
						const isNumericKeyword = !isNaN(keyword);
						return isNumericKeyword ? fieldValue === Number(keyword) : fieldValue && fieldValue
							.toString().toLowerCase().includes(keyword.toLowerCase());
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

			handleSqlSearch() {
				const sqlQuery = this.sqlSearchForm.sqlQuery.trim();
				if (sqlQuery === "") {
					// 如果 SQL 語法為空，不執行搜索
					return;
				}

				// 處理 SQL 語法搜索的功能
				this.$axios.post("/api/database/" + this.axiospath + "/sql-search", {
						sqlQuery
					})
					.then((res) => {
						// 處理後端返回的數據，更新表格數據和分頁等
						// 設置分頁數據
						this.allTableData = res.data;
						this.setPaginations();

						// 重置分頁索引
						this.paginations.page_index = 1;
					})
					.catch((error) => {
						console.error("SQL搜尋失敗", error);
					});
			},

			setPaginations() {
				// 分頁屬性設置
				this.paginations.total = this.allTableData.length;
				this.paginations.page_index = 1;

				// 設置默認的分頁數據
				this.tableData = this.paginateData(this.allTableData);
			},


			// 在前端的 handleModify 方法中
			handleModify() {
				if (this.modifyFormData) {
					const idToModify = this.modifyFormData.id;

					// 動態生成要更新的資料
					const updateData = {};
					this.tableColumns.forEach(field => {
						if (field.prop !== 'createdate' && field.prop !== 'birthday' && field.prop !==
							'lastlogin' && field.prop !== 'lastlogon') {
							// 格式化日期
							if (field.prop === 'lastlogin' && this.modifyFormData[field.prop]) {
								updateData[field.prop] = new Date(this.modifyFormData[field.prop]).toISOString()
									.slice(0, 19).replace('T', ' ');
							} else {
								updateData[field.prop] = this.modifyFormData[field.prop];
							}
						}
					});

					this.$axios.put(`/api/database/` + this.axiospath + `/modify/${idToModify}`, updateData)
						.then(response => {
							console.log("修改成功", response.data);
							console.log("filteredData after modification:", this.filteredData);
							this.getSearch();
						})
						.catch(error => {
							console.error("修改失败", error);
						})
						.finally(() => {
							this.modifyDialogVisible = false;
							this.modifyFormData = {};

							// 更新 tableData 和 allTableData
							console.log("Updating tableData and allTableData...");
							this.$set(this, 'tableData', [...this.filteredData]);
							this.$set(this, 'allTableData', [...this.filteredData]);
						});
				}
			},



			handleFieldChange() {
				// 在欄位更改時，重新設置 tableData 和分頁相關的屬性
				this.setPaginations();

				// 只有在搜尋按鈕被點擊且有輸入關鍵字的情況下才進行搜尋
				if (this.isSearchButtonClicked && this.searchForm.keyword) {
					this.handleSearch();
				} else {
					// 如果沒有輸入關鍵字，則使用 allTableData
					this.tableData = this.paginateData(this.allTableData);

					this.paginations.total = this.allTableData.length;
				}

				// 清空關鍵字
				this.searchForm.keyword = '';
				this.sqlSearchForm.sqlQuery = '';
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
				this.sqlSearchForm.sqlQuery = '';
				this.searchForm.startTime = '';
				this.searchForm.endTime = '';

				// 重置搜尋按鈕點擊狀態
				this.isSearchButtonClicked = false;
			},



			paginateData(data) {
				const startIndex = (this.paginations.page_index - 1) * this.paginations.page_size;
				return data.slice(startIndex, startIndex + this.paginations.page_size);
			},

			handleSizeChange(page_size) {
				// 切換每頁顯示條數
				this.paginations.page_size = page_size;

				// 重新計算 total，並更新 tableData
				this.paginations.total = this.paginateData(this.filteredData).length;

				// 確保獲取了新的搜尋欄位值，然後再進行搜索
				this.handleSearch();
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

			clearSqlQuery() {
				// 清空 SQL 輸入欄
				this.sqlSearchForm.sqlQuery = '';
				this.searchForm.keyword = '';
				this.searchForm.startTime = '';
				this.searchForm.endTime = '';
				this.searchnum = 0;
				this.searchAnswers = {};

				// 回到未進行搜尋時的數據
				this.getSearch();
			},

			confirmDeleteSearch() {
				this.deleteSearchDialogVisible = true;
			},

			handleDeleteSearch() {
				// 執行一併刪除(頁面 搜索結果)
				const idsToDelete = this.tableData.map(item => item.id);
				this.$axios.post("/api/database/" + this.axiospath + "/delete-all", {
						ids: idsToDelete
					})
					.then(response => {
						console.log("一併刪除成功(當前頁搜索結果)", response.data);
						this.getSearch(); // 重新獲取數據
					})
					.catch(error => {
						console.error("一併刪除失败", error);
					})
					.finally(() => {
						this.deleteSearchDialogVisible = false;
					});
			},

			confirmDeleteAll() {
				this.deleteAllDialogVisible = true;
			},

			handleDeleteAll() {
				// 執行一併刪除(全 搜索結果)
				const idsToDelete = this.filteredData.map(item => item.id);
				this.$axios.post("/api/database/" + this.axiospath + "/delete-all", {
						ids: idsToDelete
					})
					.then(response => {
						console.log("一併刪除成功（全部搜索结果）", response.data);
						this.getSearch();
					})
					.catch(error => {
						console.error("一併刪除失败（全部搜索结果）", error);
					})
					.finally(() => {
						this.deleteAllDialogVisible = false;
					});
			},

			openModifyDialog() {
				this.modifyDialogVisibleAll = true;
			},

			handleModifyAll() {
				if (this.selectedField && this.newValue) {
					// 獲取要修改的字段和新值
					const fieldToUpdate = this.selectedField;
					const newValue = this.newValue;

					// 獲取要修改的數據的 ID 列表
					const idsToUpdate = this.filteredData.map(item => item.id);

					// 發送修改请求
					this.$axios.post("/api/database/" + this.axiospath + "/modify-all", {
							ids: idsToUpdate,
							field: fieldToUpdate,
							value: newValue,
						})
						.then(response => {
							console.log("一併修改成功", response.data);
							this.modifyDialogVisibleAll = false;
							this.getSearch();
						})
						.catch(error => {
							console.error("一併修改失败", error);
							this.modifyDialogVisibleAll = false;
						});
				}
			},

			exportTxt() {
				// 檢查是否有進行中的搜索
				const isSearchActive = this.searchForm.keyword || (this.searchForm.startTime && this.searchForm.endTime);
				console.log(this.searchForm.keyword);

				let apiEndpoint = '/api/database/' + this.axiospath + '/export-txt';

				if (isSearchActive) {
					if (this.searchForm.keyword && (this.searchForm.startTime && this.searchForm.endTime)) {
						const startDay = new Date(this.searchForm.startTime).toISOString();
						const endDay = new Date(this.searchForm.endTime).toISOString();
						apiEndpoint =
							`/api/database/` + this.axiospath +
							`/export-txt-search-both?searchField=${this.searchForm.searchField}&keyword=${this.searchForm.keyword}&timeField=${this.searchForm.timeField}&startTime=${startDay}&endTime=${endDay}`;
					} else if (!this.searchForm.keyword) {
						const startDay = new Date(this.searchForm.startTime).toISOString();
						const endDay = new Date(this.searchForm.endTime).toISOString();
						apiEndpoint =
							`/api/database/` + this.axiospath +
							`/export-txt-search-time?searchField=${this.searchForm.timeField}&startTime=${startDay}&endTime=${endDay}`;
					} else {
						apiEndpoint =
							`/api/database/` + this.axiospath +
							`/export-txt-search-keyword?searchField=${this.searchForm.searchField}&keyword=${this.searchForm.keyword}`;
					}
				}

				// 發送導出 TXT 的請求
				this.$axios.get(apiEndpoint)
					.then(response => {
						// 將服務器返回的數據保存為 TXT 文件
						const blob = new Blob([response.data], {
							type: 'text/plain'
						});
						const link = document.createElement('a');
						link.href = window.URL.createObjectURL(blob);
						link.download = this.axiospath + '.txt';
						link.click();
					})
					.catch(error => {
						console.error('導出 TXT 失敗：', error);
					});
			},

			openAddDialog() {
				// 打開表單前清空數據
				this.addFormData = {};
				this.addDialogVisible = true;
				const sampleData = this.allTableData.length > 0 ? this.allTableData[0] : {};
				this.tableFields = Object.keys(sampleData);
			},

			generateFormFields() {
				// 清空formData
				this.formData = {};

				// 根據tableFields生成字段
				this.tableFields.forEach(field => {
					// 使用欄位名作為字段
					this.$set(this.formData, field.prop, '');
				});
			},

			cancelAdd() {
				this.addDialogVisible = false;
				this.addFormData = {};
			},

			handleAdd() {
				this.$axios.post("/api/database/" + this.axiospath + "/add", this.addFormData)
					.then(response => {
						console.log("新增數據成功", response.data);
						this.getSearch();
						this.addDialogVisible = false;
					})
					.catch(error => {
						console.error("新增數據失败", error);
					});
			},


		},
	};
</script>

<style>
	.sql-input {
		width: 80vw;
	}

	.sql-container {
		margin-top: 1%;
		margin-left: 0.5%;
	}

	.search-container {
		margin-left: 0.5%;
	}

	.table-toolbar {
		display: flex;
		justify-content: flex-end;
		margin: 0.5%;
	}

	.left-button {
		margin-right: auto;
	}
</style>
