/*
 * Copyright (c) 2021 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.marklogic.hub.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.StepDefinitionManager;
import com.marklogic.hub.dataservices.StepService;
import com.marklogic.hub.error.DataHubProjectException;
import com.marklogic.hub.step.StepDefinition;
import com.marklogic.hub.step.StepDefinition.StepDefinitionType;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.tuple.Pair;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

@Component
public class ScaffoldingImpl extends LoggingObject implements Scaffolding {

    @Autowired
    HubConfig hubConfig;

    Versions versions;

    public ScaffoldingImpl() {}

    public ScaffoldingImpl(HubConfig hubConfig) {
        this();
        this.hubConfig = hubConfig;
    }

    public static String getAbsolutePath(String first, String... more) {
        StringBuilder absolutePath = new StringBuilder(first);
        for (String path : more) {
            absolutePath.append(File.separator);
            absolutePath.append(path);
        }
        return absolutePath.toString();
    }

    /**
     *
     * @param name
     * @param type
     * @param format
     * @return the new step definition
     */
    public StepDefinition createStepDefinition(String name, String type, String format) {
        StepDefinition stepDef = StepDefinition.create(name, StepDefinition.StepDefinitionType.getStepDefinitionType(type));

        StepDefinitionManager stepDefinitionManager = new StepDefinitionManagerImpl(this.hubConfig);
        if (stepDefinitionManager.getStepDefinition(name, stepDef.getType()) != null) {
            throw new IllegalArgumentException(format("A step definition already exists with the name '%s' and type '%s'", name, type));
        }

        stepDef.setModulePath(String.format("/custom-modules/%s/%s/main.sjs", type.toLowerCase(), name));
        stepDefinitionManager.saveStepDefinition(stepDef);
        createCustomModule(name, type, format);

        return stepDef;
    }

    public Pair<File, String> createStepFile(String stepName, String stepType, String stepDefName, String entityType) {
        return createStepFile(stepName, stepType, stepDefName, entityType, false);
    }
    /**
     * Create a step file  based on the given stepName, stepType, entityType (for non ingestion steps),
     *  and stepDefName.
     *
     * @param stepName
     * @param stepType
     * @param stepDefName
     * @param entityType
     * @return a Pair with a File representing the created file, and a String representing an optional message that,
     * if not null, should likely be presented to the caller
     */
    public Pair<File, String> createStepFile(String stepName, String stepType, String stepDefName, String entityType, boolean acceptSourceModule) {
        Pair<JsonNode, String> stepPayLoadPair = getStepConfig(stepName, stepType, stepDefName, entityType, acceptSourceModule);
        Pair<File, String> step = saveStep(stepType, stepPayLoadPair.getLeft());
        return Pair.of(step.getLeft(), stepPayLoadPair.getRight().concat(step.getRight()));
    }

    public Pair<JsonNode, String> getStepConfig(String stepName, String stepType, String stepDefName, String entityType, boolean acceptSourceModule) {
        StepDefinitionManager stepDefinitionManager = new StepDefinitionManagerImpl(hubConfig);
        StepDefinitionType stepDefType = StepDefinitionType.getStepDefinitionType(stepType);
        Assert.notNull(stepDefType, "Unrecognized step type: " + stepType);

        StepDefinition stepDefinition = null;
        StringBuilder messageBuilder = new StringBuilder();
        File stepFile = hubConfig.getHubProject().getStepFile(stepDefType, stepName);
        if (stepFile.exists()) {
            throw new IllegalArgumentException("Cannot create step; a step file already exists at: " + stepFile.getAbsolutePath() + ". Please choose a different name for your step.");
        }
        stepFile.getParentFile().mkdirs();

        ObjectMapper objectMapper = new ObjectMapper();
        ObjectNode stepPayLoad = objectMapper.createObjectNode();
        stepPayLoad.put("name", stepName);
        stepPayLoad.put("description", "");
        stepPayLoad.put("stepDefinitionType", stepType);
        if(stepDefName != null) {
            stepPayLoad.put("stepDefinitionName", stepDefName);
        }
        else {
            if(StepDefinitionType.CUSTOM.equals(stepDefType)){
                stepDefName = stepName;
                stepPayLoad.put("stepDefinitionName", stepDefName);
            }
        }

        if ("ingestion".equalsIgnoreCase(stepType)) {
            stepPayLoad.put("sourceFormat", "json");
            stepPayLoad.put("targetFormat", "json");
        }
        else {
            stepPayLoad.put("selectedSource", "query");
            if("custom".equalsIgnoreCase(stepType) || "mapping".equalsIgnoreCase(stepType)){
                if(acceptSourceModule) {
                    stepPayLoad.put("selectedSource", "sourceModule");
                    ObjectNode node = objectMapper.createObjectNode();
                    node.put("modulePath", "");
                    node.put("functionName", "");
                    stepPayLoad.put("sourceModule", node);
                } else {
                    stepPayLoad.put("sourceQuery", "cts.collectionQuery('changeme')");
                }
                if(entityType != null){
                    stepPayLoad.put("entityType", entityType);
                }
                if("mapping".equalsIgnoreCase(stepType)){
                    stepPayLoad.put("attachSourceDocument", false);
                }
            }
        }

        if (stepDefName != null && stepDefinitionManager.getStepDefinition(stepDefName, StepDefinitionType.getStepDefinitionType(stepType)) == null) {
            try{
                stepDefinition = StepDefinition.create(stepDefName, StepDefinitionType.getStepDefinitionType(stepType));
                stepDefinition.setModulePath("/custom-modules/" + stepType.toLowerCase() + "/" + stepDefName + "/main.mjs");
                stepDefinitionManager.saveStepDefinition(stepDefinition);
            }
            catch(Exception e){
                throw new RuntimeException("Unable to write step definition to database; cause: " + e.getMessage(), e);
            }
            createCustomModule(stepDefName, stepType);
            messageBuilder.append(String.format("Created step definition '%s' of type '%s'.\n", stepName, stepType));
            messageBuilder.append("The module file for the step definition is available at "
                + "/custom-modules/" + stepType.toLowerCase() + "/" + stepDefName + "/main.mjs" + ". \n");
            messageBuilder.append("It is recommended to run './gradlew -i mlWatch' so that as you modify the module, it will be automatically loaded into your application's modules database.\n");
        }
        return Pair.of(stepPayLoad, messageBuilder.toString());
    }

    public Pair<File, String> saveStep(String stepType, JsonNode stepPayLoad) {
        DatabaseClient stagingClient = hubConfig.newHubClient().getStagingClient();
        JsonNode step;
        String stepName = stepPayLoad.get("name").asText();
        File stepFile = hubConfig.getHubProject().getStepFile(StepDefinitionType.getStepDefinitionType(stepType), stepName);
        StringBuilder messageBuilder = new StringBuilder();
        try {
            StepService stepService = StepService.on(stagingClient);
            //We don't update step using this command, hence 'overwrite' is set to false and 'throwErrorIfStepIsPresent' is set to 'true'
            step = stepService.saveStep(stepType, stepPayLoad, false, true);
        } catch (Exception e) {
            throw new RuntimeException("Unable to write step to database; cause: " + e.getMessage(), e);
        }
        messageBuilder.append("Created step '" + stepName + "' of type '" + stepType + "' with default properties. The step has been deployed to staging and final databases.");
        try {
            new ObjectMapper().writerWithDefaultPrettyPrinter().writeValue(stepFile, step);
            return Pair.of(stepFile, messageBuilder.toString());
        } catch (IOException e) {
            throw new RuntimeException("Unable to write step to file: " + stepFile.getAbsolutePath() + "; cause: " + e.getMessage(), e);
        }
    }

    @Override public void createEntity(String entityName) {
        Path entityDir = hubConfig.getHubProject().getHubEntitiesDir();

        File entityFile = entityDir.resolve(entityName + ".entity.json").toFile();
        if (entityFile.exists()) {
            throw new DataHubProjectException("Entity with that name already exists.");
        }

        File entityDirFile = entityDir.toFile();
        if(!entityDirFile.exists()){
            entityDirFile.mkdirs();
        }
        String fileContents = getFileContent("scaffolding/Entity.json", entityName);
        writeToFile(fileContents, entityFile);
    }

    @Override public void createMappingDir(String mappingName) {
        Path mappingDir = hubConfig.getHubProject().getMappingDir(mappingName);
        mappingDir.toFile().mkdirs();
    }

    @Override
    public void createCustomModule(String stepName, String stepType) {
        createCustomModule(stepName, stepType, "sjs");
    }

    @Override
    public void createCustomModule(String stepName, String stepType, String format) {
        Path customModuleDir = hubConfig.getHubProject().getCustomModuleDir(stepName, stepType.toLowerCase());
        customModuleDir.toFile().mkdirs();

        if (customModuleDir.toFile().exists()) {
            String moduleScaffoldingSrcFile;
            File moduleFile;
            File libFile;
            String libScaffoldingSrcFile = null;
            if("sjs".equalsIgnoreCase(format)) {
                moduleScaffoldingSrcFile = "scaffolding/custom-module/sjs/main-" + stepType.toLowerCase() + ".sjs";
            }
            else if("mjs".equalsIgnoreCase(format)) {
                moduleScaffoldingSrcFile = "scaffolding/custom-module/sjs/main-" + stepType.toLowerCase() + ".mjs";
            }
            else if("xqy".equalsIgnoreCase(format)) {
                moduleScaffoldingSrcFile = "scaffolding/custom-module/xqy/main-" + stepType.toLowerCase() + ".sjs";
                libScaffoldingSrcFile = "scaffolding/custom-module/xqy/lib-" + stepType.toLowerCase() + ".xqy";
            }
            else {
                throw new RuntimeException("Invalid code format. The allowed formats are 'xqy' , 'sjs' or 'mjs'");
            }
            moduleFile = customModuleDir.resolve("main.sjs").toFile();
            InputStream inputStream = ScaffoldingImpl.class.getClassLoader().getResourceAsStream(moduleScaffoldingSrcFile);
            try {
                if (logger.isInfoEnabled()) {
                    logger.info(format("Writing module to: %s", moduleFile.getAbsolutePath()));
                }
                FileUtils.copyInputStreamToFile(inputStream, moduleFile);
                libFile = customModuleDir.resolve("lib.xqy").toFile();
                if(libScaffoldingSrcFile != null) {
                    InputStream libInputStream = ScaffoldingImpl.class.getClassLoader().getResourceAsStream(libScaffoldingSrcFile);
                    if (logger.isInfoEnabled()) {
                        logger.info(format("Writing module to: %s", libFile.getAbsolutePath()));
                    }
                    FileUtils.copyInputStreamToFile(libInputStream, libFile);
                }
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
    }

    @Override
    public File createDefaultFlow(String flowName) {
        Path flowsDir = hubConfig.getHubProject().getFlowsDir();
        flowsDir.toFile().mkdirs();
        File flowFile = flowsDir.resolve(flowName + ".flow.json").toFile();

        if (flowsDir.toFile().exists()) {
            Map<String, String> customTokens = new HashMap<>();
            customTokens.put("%%mlStagingDbName%%", hubConfig.getDbName(DatabaseKind.STAGING));
            customTokens.put("%%mlFinalDbName%%", hubConfig.getDbName(DatabaseKind.FINAL));
            customTokens.put("%%mlFlowName%%", flowName);

            try {
                String fileContents = buildFlowFromDefaultFlow(customTokens);
                try (OutputStreamWriter writer = new OutputStreamWriter(new FileOutputStream(flowFile), StandardCharsets.UTF_8)) {
                    writer.write(fileContents);
                }
            }
            catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
        return flowFile;
    }

    protected String buildFlowFromDefaultFlow(Map<String, String> customTokens) throws IOException {
        String flowSrcFile = "scaffolding/defaultFlow.flow.json";
        String fileContents = null;
        try (InputStream inputStream = ScaffoldingImpl.class.getClassLoader().getResourceAsStream(flowSrcFile)) {
            assert inputStream != null;
            fileContents = IOUtils.toString(inputStream);
            for (Map.Entry<String, String> entry : customTokens.entrySet()) {
                String value = entry.getValue();
                if (value != null) {
                    fileContents = fileContents.replace(entry.getKey(), value);
                }
            }
        }
        return fileContents;
    }

    private void writeToFile(String fileContent, File dstFile) {
        try (BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(dstFile),StandardCharsets.UTF_8))) {
            bw.write(fileContent);
        } catch(IOException e) {
            throw new RuntimeException(e);
        }
    }

    private String getFileContent(String srcFile, String placeholder) {
        StringBuilder output = new StringBuilder();
        InputStream inputStream = null;
        BufferedReader rdr = null;
        try {
            inputStream = Scaffolding.class.getClassLoader()
                .getResourceAsStream(srcFile);
            rdr = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8));
            String bufferedLine = null;
            while ((bufferedLine = rdr.readLine()) != null) {
                if(bufferedLine.contains("placeholder")) {
                    bufferedLine = bufferedLine.replace("placeholder", placeholder);
                }
                output.append(bufferedLine);
                output.append("\n");
            }
            inputStream.close();
            rdr.close();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return output.toString();
    }
}
